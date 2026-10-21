package com.updateme.data.model

import kotlinx.serialization.Serializable

@Serializable
data class IndexAppProvider(
    val source: String = "",
    val version: String = "",
    val packageName: String = "",
    val download: String = "",
    val safe: Boolean = true,
    val sha256: String = ""
)

@Serializable
data class IndexApp(
    val icon: String = "",
    val depends: List<String> = emptyList(),
    val complements: List<String> = emptyList(),
    val features: List<String> = emptyList(),
    val providers: Map<String, IndexAppProvider> = emptyMap()
)

@Serializable
data class CategoryItem(
    val apps: List<String> = emptyList(),
    val icon: String = ""
)

@Serializable
data class TipStep(
    val image: String = "",
    val description: String = ""
)

@Serializable
data class TipItem(
    val description: String = "",
    val content: List<TipStep> = emptyList()
)

@Serializable
data class ReleaseNote(
    val title: String = "",
    val description: String = ""
)

@Serializable
data class AppRelease(
    val version: String = "",
    val download: String = "",
    val releaseNotes: List<ReleaseNote> = emptyList()
)

data class DownloadedApk(
    val fileName: String,
    val filePath: String,
    val sizeBytes: Long,
    val lastModified: Long
)

enum class DownloadStatus {
    IDLE,
    DOWNLOADING,
    COMPLETED,
    FAILED
}

data class ActiveDownload(
    val appName: String,
    val providerName: String,
    val progress: Float = 0f,
    val bytesDownloaded: Long = 0,
    val totalBytes: Long = 0,
    val status: DownloadStatus = DownloadStatus.DOWNLOADING,
    val error: String? = null
)
