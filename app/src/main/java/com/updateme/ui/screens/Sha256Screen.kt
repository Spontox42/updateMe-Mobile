package com.updateme.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.FileOpen
import androidx.compose.material.icons.filled.Fingerprint
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.updateme.data.model.DownloadedApk
import com.updateme.ui.theme.DangerRed
import com.updateme.ui.theme.SafeGreen
import com.updateme.ui.viewmodel.MainUiState
import com.updateme.ui.viewmodel.MainViewModel
import kotlinx.coroutines.launch
import java.io.File

@Composable
fun Sha256Screen(
    uiState: MainUiState,
    viewModel: MainViewModel,
    initialApk: DownloadedApk? = null
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var selectedFileName by remember { mutableStateOf(initialApk?.fileName ?: "") }
    var calculatedHash by remember { mutableStateOf("") }
    var isCalculating by remember { mutableStateOf(false) }
    var expectedHash by remember { mutableStateOf("") }

    val filePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            val name = uri.lastPathSegment?.substringAfterLast('/') ?: "Selected APK"
            selectedFileName = name
            isCalculating = true
            calculatedHash = ""
            scope.launch {
                try {
                    context.contentResolver.openInputStream(uri)?.use { stream ->
                        calculatedHash = viewModel.calculateSha256(stream)
                    }
                } catch (e: Exception) {
                    viewModel.showToast("Failed to calculate SHA-256: ${e.message}")
                } finally {
                    isCalculating = false
                }
            }
        }
    }

    LaunchedEffect(initialApk) {
        if (initialApk != null) {
            selectedFileName = initialApk.fileName
            isCalculating = true
            calculatedHash = ""
            scope.launch {
                try {
                    calculatedHash = viewModel.calculateSha256(File(initialApk.filePath))
                } catch (e: Exception) {
                    viewModel.showToast("Failed to calculate SHA-256")
                } finally {
                    isCalculating = false
                }
            }
        }
    }

    fun copyToClipboard(text: String) {
        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        val clip = ClipData.newPlainText("SHA-256", text)
        clipboard.setPrimaryClip(clip)
        viewModel.showToast("SHA-256 copied to clipboard")
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp)
            .testTag("sha256_screen"),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Intro Header
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Fingerprint,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(36.dp)
                )
                Spacer(modifier = Modifier.width(16.dp))
                Column {
                    Text(
                        text = "SHA-256 Checksum Verifier",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Verify the authenticity and integrity of APK packages against known hashes.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        // Quick Pick from Downloaded Files
        if (uiState.downloadedFiles.isNotEmpty()) {
            Text(
                text = "Select from Downloaded APKs",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold
            )

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                uiState.downloadedFiles.forEach { apk ->
                    FilterChip(
                        selected = selectedFileName == apk.fileName,
                        onClick = {
                            selectedFileName = apk.fileName
                            isCalculating = true
                            calculatedHash = ""
                            scope.launch {
                                try {
                                    calculatedHash = viewModel.calculateSha256(File(apk.filePath))
                                } catch (_: Exception) {
                                    viewModel.showToast("Failed to compute hash")
                                } finally {
                                    isCalculating = false
                                }
                            }
                        },
                        label = { Text(apk.fileName, maxLines = 1) }
                    )
                }
            }
        }

        // Action: Pick File
        Button(
            onClick = { filePicker.launch("application/vnd.android.package-archive") },
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
                .testTag("pick_apk_button")
        ) {
            Icon(Icons.Default.FileOpen, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Choose APK File")
        }

        // Result Card
        if (selectedFileName.isNotEmpty() || isCalculating) {
            OutlinedCard(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Selected File:",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = selectedFileName,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    if (isCalculating) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(vertical = 12.dp)
                        ) {
                            CircularProgressIndicator(modifier = Modifier.size(24.dp))
                            Spacer(modifier = Modifier.width(12.dp))
                            Text("Calculating SHA-256 hash...", style = MaterialTheme.typography.bodyMedium)
                        }
                    } else if (calculatedHash.isNotEmpty()) {
                        Text(
                            text = "SHA-256 Checksum:",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(
                                    MaterialTheme.colorScheme.surfaceContainerHigh,
                                    RoundedCornerShape(8.dp)
                                )
                                .padding(12.dp)
                        ) {
                            Text(
                                text = calculatedHash,
                                style = MaterialTheme.typography.bodySmall,
                                fontFamily = FontFamily.Monospace,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        OutlinedButton(
                            onClick = { copyToClipboard(calculatedHash) },
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Copy Checksum")
                        }
                    }
                }
            }
        }

        // Hash Comparator
        if (calculatedHash.isNotEmpty()) {
            Text(
                text = "Compare Checksum",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            OutlinedTextField(
                value = expectedHash,
                onValueChange = { expectedHash = it.trim() },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("expected_hash_input"),
                label = { Text("Paste Expected Hash") },
                placeholder = { Text("e.g. bce3708dd841...") },
                singleLine = true,
                trailingIcon = {
                    if (expectedHash.isNotEmpty()) {
                        IconButton(onClick = { expectedHash = "" }) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear")
                        }
                    }
                },
                shape = RoundedCornerShape(12.dp)
            )

            if (expectedHash.isNotEmpty()) {
                val matches = expectedHash.equals(calculatedHash, ignoreCase = true)
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (matches) SafeGreen.copy(alpha = 0.15f) else DangerRed.copy(alpha = 0.15f)
                    )
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = if (matches) Icons.Default.CheckCircle else Icons.Default.Error,
                            contentDescription = null,
                            tint = if (matches) SafeGreen else DangerRed,
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = if (matches) "Hash Matches!" else "Hash Mismatch!",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = if (matches) SafeGreen else DangerRed
                            )
                            Text(
                                text = if (matches) {
                                    "The file is authentic and matches the expected release checksum."
                                } else {
                                    "The file does not match the expected hash. It may be corrupted or modified."
                                },
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            }
        }
    }
}
