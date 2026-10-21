package com.updateme.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Launch
import androidx.compose.material.icons.filled.OpenInBrowser
import androidx.compose.material.icons.filled.SecurityUpdate
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.updateme.data.model.ActiveDownload
import com.updateme.data.model.DownloadStatus
import com.updateme.data.model.IndexAppProvider
import com.updateme.ui.theme.DangerRed
import com.updateme.ui.theme.SafeGreen
import com.updateme.ui.theme.WarningOrange
import com.updateme.ui.viewmodel.MainUiState
import com.updateme.ui.viewmodel.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppDetailScreen(
    appName: String,
    uiState: MainUiState,
    viewModel: MainViewModel,
    activeDownloads: Map<String, ActiveDownload>,
    onBack: () -> Unit,
    onNavigateToApp: (String) -> Unit
) {
    val context = LocalContext.current
    val app = uiState.index[appName]
    val installedVer = uiState.installedVersions[appName]
    val activeDownload = activeDownloads[appName]

    val defaultProvider = app?.let { viewModel.getEffectiveProvider(appName, it) }
    val defaultProviderName = app?.let { viewModel.getEffectiveProviderName(appName, it) } ?: ""
    val availableVer = defaultProvider?.version ?: "N/A"

    val installUnsafeApps by viewModel.settingsManager.installUnsafeApps.collectAsState()
    var showUnsafeDialogForProvider by remember { mutableStateOf<Pair<String, IndexAppProvider>?>(null) }

    fun copyToClipboard(label: String, text: String) {
        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        val clip = ClipData.newPlainText(label, text)
        clipboard.setPrimaryClip(clip)
        viewModel.showToast("$label copied to clipboard")
    }

    if (app == null) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text(appName) },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                        }
                    }
                )
            }
        ) { padding ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Text("App details not found.")
            }
        }
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(appName, maxLines = 1, overflow = TextOverflow.Ellipsis) },
                navigationIcon = {
                    IconButton(onClick = onBack, modifier = Modifier.testTag("app_detail_back")) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header: Icon + Title + Version comparison
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    modifier = Modifier
                        .size(80.dp)
                        .clip(RoundedCornerShape(20.dp)),
                    color = MaterialTheme.colorScheme.surfaceContainerHigh
                ) {
                    AsyncImage(
                        model = app.icon,
                        contentDescription = "$appName icon",
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                }

                Spacer(modifier = Modifier.width(16.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = appName,
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Provider: $defaultProviderName",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.primary
                    )
                    if (defaultProvider != null) {
                        Text(
                            text = defaultProvider.packageName,
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }

            // Version Comparison Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer),
                shape = RoundedCornerShape(16.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceAround,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "Installed Version",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = installedVer ?: "Not Installed",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = if (installedVer != null) SafeGreen else MaterialTheme.colorScheme.error
                        )
                    }

                    Box(
                        modifier = Modifier
                            .height(40.dp)
                            .width(1.dp)
                            .background(MaterialTheme.colorScheme.outlineVariant)
                    )

                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "Available Version",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = availableVer,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }

            // Actions: Install / Update / Open & Uninstall
            val hasUpdate = installedVer != null && MainViewModel.isVersionNewer(availableVer, installedVer)

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                if (installedVer != null && defaultProvider != null) {
                    OutlinedButton(
                        onClick = {
                            viewModel.packageManagerHelper.requestUninstall(defaultProvider.packageName)
                        },
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                            .testTag("app_detail_uninstall"),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = MaterialTheme.colorScheme.error
                        )
                    ) {
                        Icon(Icons.Default.Delete, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Uninstall")
                    }
                }

                if (activeDownload != null && activeDownload.status == DownloadStatus.DOWNLOADING) {
                    FilledTonalButton(
                        onClick = { viewModel.cancelDownload(appName) },
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                    ) {
                        CircularProgressIndicator(
                            progress = activeDownload.progress,
                            modifier = Modifier.size(20.dp),
                            strokeWidth = 2.dp
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Cancel (${(activeDownload.progress * 100).toInt()}%)")
                    }
                } else if (hasUpdate && defaultProvider != null) {
                    Button(
                        onClick = {
                            if (!defaultProvider.safe && !installUnsafeApps) {
                                showUnsafeDialogForProvider = defaultProviderName to defaultProvider
                            } else {
                                viewModel.startDownload(appName, defaultProviderName, defaultProvider)
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = WarningOrange),
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                            .testTag("app_detail_update")
                    ) {
                        Icon(Icons.Default.SecurityUpdate, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Update App")
                    }
                } else if (installedVer != null && defaultProvider != null) {
                    Button(
                        onClick = {
                            viewModel.packageManagerHelper.openApp(defaultProvider.packageName)
                        },
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                            .testTag("app_detail_open")
                    ) {
                        Icon(Icons.Default.Launch, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Open App")
                    }
                } else if (defaultProvider != null) {
                    Button(
                        onClick = {
                            if (!defaultProvider.safe && !installUnsafeApps) {
                                showUnsafeDialogForProvider = defaultProviderName to defaultProvider
                            } else {
                                viewModel.startDownload(appName, defaultProviderName, defaultProvider)
                            }
                        },
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                            .testTag("app_detail_install")
                    ) {
                        Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Install App")
                    }
                }
            }

            // Dependency / Complement Banners
            if (app.depends.isNotEmpty()) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.5f)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Info, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Required Dependencies",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "$appName requires: ${app.depends.joinToString(", ")} to work properly.",
                            style = MaterialTheme.typography.bodySmall
                        )
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 8.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            app.depends.forEach { dep ->
                                val isDepInstalled = uiState.installedVersions.containsKey(dep)
                                OutlinedButton(
                                    onClick = { onNavigateToApp(dep) },
                                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                    modifier = Modifier.height(32.dp)
                                ) {
                                    Text(
                                        text = "$dep ${if (isDepInstalled) "✓" else "(Install)"}",
                                        style = MaterialTheme.typography.labelSmall
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Features Section
            if (app.features.isNotEmpty()) {
                Text(
                    text = "Key Features",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )

                OutlinedCard(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        app.features.forEach { feature ->
                            Row(verticalAlignment = Alignment.Top) {
                                Box(
                                    modifier = Modifier
                                        .padding(top = 6.dp)
                                        .size(6.dp)
                                        .background(MaterialTheme.colorScheme.primary, CircleShape)
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Text(
                                    text = feature,
                                    style = MaterialTheme.typography.bodyMedium
                                )
                            }
                        }
                    }
                }
            }

            // Available Providers Section
            Text(
                text = "Providers (${app.providers.size})",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Providers are different sources for the same app. You can switch your preferred provider.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                app.providers.forEach { (providerName, prov) ->
                    val isDefault = providerName == defaultProviderName

                    OutlinedCard(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.outlinedCardColors(
                            containerColor = if (isDefault) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.2f)
                            else MaterialTheme.colorScheme.surface
                        )
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = providerName,
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    if (isDefault) {
                                        Surface(
                                            color = MaterialTheme.colorScheme.primary,
                                            shape = RoundedCornerShape(6.dp)
                                        ) {
                                            Text(
                                                text = "Default",
                                                style = MaterialTheme.typography.labelSmall,
                                                color = MaterialTheme.colorScheme.onPrimary,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }
                                    }
                                }

                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    if (prov.safe) {
                                        Icon(
                                            Icons.Default.CheckCircle,
                                            contentDescription = "Safe",
                                            tint = SafeGreen,
                                            modifier = Modifier.size(18.dp)
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Safe", style = MaterialTheme.typography.labelSmall, color = SafeGreen)
                                    } else {
                                        Icon(
                                            Icons.Default.Warning,
                                            contentDescription = "Potential Risk",
                                            tint = DangerRed,
                                            modifier = Modifier.size(18.dp)
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Risk", style = MaterialTheme.typography.labelSmall, color = DangerRed)
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            // Provider details
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "Version: ${prov.version}",
                                    style = MaterialTheme.typography.bodySmall
                                )
                                Text(
                                    text = "Pkg: ${prov.packageName}",
                                    style = MaterialTheme.typography.bodySmall,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }

                            if (prov.sha256.isNotBlank()) {
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "SHA-256: ${prov.sha256.take(16)}...",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            // Action buttons for provider
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                if (prov.source.isNotBlank()) {
                                    OutlinedButton(
                                        onClick = {
                                            val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(prov.source)).apply {
                                                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                            }
                                            context.startActivity(browserIntent)
                                        },
                                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                        modifier = Modifier.height(34.dp)
                                    ) {
                                        Icon(Icons.Default.OpenInBrowser, contentDescription = null, modifier = Modifier.size(14.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Source", style = MaterialTheme.typography.labelSmall)
                                    }
                                }

                                if (prov.sha256.isNotBlank()) {
                                    OutlinedButton(
                                        onClick = { copyToClipboard("SHA-256", prov.sha256) },
                                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                        modifier = Modifier.height(34.dp)
                                    ) {
                                        Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(14.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("SHA-256", style = MaterialTheme.typography.labelSmall)
                                    }
                                }

                                Spacer(modifier = Modifier.weight(1f))

                                if (!isDefault) {
                                    OutlinedButton(
                                        onClick = {
                                            viewModel.settingsManager.setDefaultProvider(appName, providerName)
                                            viewModel.showToast("$providerName set as default")
                                        },
                                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                        modifier = Modifier.height(34.dp)
                                    ) {
                                        Icon(Icons.Default.Star, contentDescription = null, modifier = Modifier.size(14.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Set Default", style = MaterialTheme.typography.labelSmall)
                                    }
                                }

                                Button(
                                    onClick = {
                                        if (!prov.safe && !installUnsafeApps) {
                                            showUnsafeDialogForProvider = providerName to prov
                                        } else {
                                            viewModel.startDownload(appName, providerName, prov)
                                        }
                                    },
                                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                    modifier = Modifier.height(34.dp)
                                ) {
                                    Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Download", style = MaterialTheme.typography.labelSmall)
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }

        // Unsafe Provider Warning Dialog
        val pendingUnsafe = showUnsafeDialogForProvider
        if (pendingUnsafe != null) {
            AlertDialog(
                onDismissRequest = { showUnsafeDialogForProvider = null },
                icon = { Icon(Icons.Default.Warning, contentDescription = null, tint = DangerRed) },
                title = { Text("Potentially Unsafe APK") },
                text = {
                    Text(
                        "The VirusTotal analysis of this APK from provider '${pendingUnsafe.first}' reported potential security risks. To install it anyway, enable the 'Risk Taker' setting in the Settings page or confirm to continue."
                    )
                },
                confirmButton = {
                    Button(
                        onClick = {
                            viewModel.startDownload(appName, pendingUnsafe.first, pendingUnsafe.second)
                            showUnsafeDialogForProvider = null
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = DangerRed)
                    ) {
                        Text("Install Anyway")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showUnsafeDialogForProvider = null }) {
                        Text("Cancel")
                    }
                }
            )
        }
    }
}
