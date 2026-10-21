package com.updateme.data.repository

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Environment
import androidx.core.content.FileProvider
import com.updateme.data.model.ActiveDownload
import com.updateme.data.model.DownloadStatus
import com.updateme.data.model.DownloadedApk
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.security.MessageDigest

class DownloadHelper(private val context: Context) {

    private val client = OkHttpClient.Builder().build()

    private val _activeDownloads = MutableStateFlow<Map<String, ActiveDownload>>(emptyMap())
    val activeDownloads: StateFlow<Map<String, ActiveDownload>> = _activeDownloads.asStateFlow()

    private val downloadsDir: File
        get() {
            val dir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
                ?: File(context.filesDir, "downloads")
            if (!dir.exists()) {
                dir.mkdirs()
            }
            return dir
        }

    fun getDownloadedFiles(): List<DownloadedApk> {
        val files = downloadsDir.listFiles { file -> file.isFile && file.name.endsWith(".apk", ignoreCase = true) }
            ?: emptyArray()
        return files.map { file ->
            DownloadedApk(
                fileName = file.name,
                filePath = file.absolutePath,
                sizeBytes = file.length(),
                lastModified = file.lastModified()
            )
        }.sortedByDescending { it.lastModified }
    }

    suspend fun downloadApk(
        appName: String,
        providerName: String,
        downloadUrl: String,
        version: String,
        autoInstall: Boolean = true
    ): Result<File> = withContext(Dispatchers.IO) {
        val safeFileName = "${appName.replace("[^a-zA-Z0-9.-]".toRegex(), "_")}_${version}.apk"
        val destinationFile = File(downloadsDir, safeFileName)

        _activeDownloads.value = _activeDownloads.value + (appName to ActiveDownload(
            appName = appName,
            providerName = providerName,
            progress = 0f,
            status = DownloadStatus.DOWNLOADING
        ))

        try {
            val request = Request.Builder().url(downloadUrl).build()
            val response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                throw IllegalStateException("Failed to download: HTTP ${response.code}")
            }

            val body = response.body ?: throw IllegalStateException("Empty response body")
            val totalBytes = body.contentLength()
            var downloadedBytes = 0L

            body.byteStream().use { input ->
                FileOutputStream(destinationFile).use { output ->
                    val buffer = ByteArray(8 * 1024)
                    var bytesRead: Int
                    while (input.read(buffer).also { bytesRead = it } != -1) {
                        output.write(buffer, 0, bytesRead)
                        downloadedBytes += bytesRead
                        val progress = if (totalBytes > 0) downloadedBytes.toFloat() / totalBytes else 0f
                        _activeDownloads.value = _activeDownloads.value + (appName to ActiveDownload(
                            appName = appName,
                            providerName = providerName,
                            progress = progress,
                            bytesDownloaded = downloadedBytes,
                            totalBytes = totalBytes,
                            status = DownloadStatus.DOWNLOADING
                        ))
                    }
                    output.flush()
                }
            }

            _activeDownloads.value = _activeDownloads.value + (appName to ActiveDownload(
                appName = appName,
                providerName = providerName,
                progress = 1f,
                bytesDownloaded = downloadedBytes,
                totalBytes = downloadedBytes,
                status = DownloadStatus.COMPLETED
            ))

            if (autoInstall) {
                withContext(Dispatchers.Main) {
                    installApk(destinationFile)
                }
            }

            Result.success(destinationFile)
        } catch (e: Exception) {
            _activeDownloads.value = _activeDownloads.value + (appName to ActiveDownload(
                appName = appName,
                providerName = providerName,
                progress = 0f,
                status = DownloadStatus.FAILED,
                error = e.localizedMessage ?: "Download failed"
            ))
            Result.failure(e)
        }
    }

    fun cancelDownload(appName: String) {
        val current = _activeDownloads.value.toMutableMap()
        current.remove(appName)
        _activeDownloads.value = current
    }

    fun installApk(file: File): Boolean {
        return try {
            val uri: Uri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                file
            )
            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, "application/vnd.android.package-archive")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
            true
        } catch (_: Exception) {
            false
        }
    }

    fun shareApk(file: File) {
        try {
            val uri: Uri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                file
            )
            val intent = Intent(Intent.ACTION_SEND).apply {
                type = "application/vnd.android.package-archive"
                putExtra(Intent.EXTRA_STREAM, uri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(Intent.createChooser(intent, "Share ${file.name}").apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            })
        } catch (_: Exception) {
        }
    }

    fun deleteFile(file: File): Boolean {
        return try {
            file.delete()
        } catch (_: Exception) {
            false
        }
    }

    fun deleteAllFiles(): Int {
        val files = downloadsDir.listFiles { file -> file.isFile && file.name.endsWith(".apk", ignoreCase = true) }
            ?: return 0
        var count = 0
        for (f in files) {
            if (f.delete()) count++
        }
        return count
    }

    suspend fun calculateSha256(file: File): String = withContext(Dispatchers.IO) {
        file.inputStream().use { calculateSha256(it) }
    }

    suspend fun calculateSha256(inputStream: InputStream): String = withContext(Dispatchers.IO) {
        val digest = MessageDigest.getInstance("SHA-256")
        val buffer = ByteArray(8 * 1024)
        var bytesRead: Int
        while (inputStream.read(buffer).also { bytesRead = it } != -1) {
            digest.update(buffer, 0, bytesRead)
        }
        val bytes = digest.digest()
        bytes.joinToString("") { "%02x".format(it) }
    }
}
