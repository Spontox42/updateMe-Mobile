package com.updateme.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Archive
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Sort
import androidx.compose.material.icons.filled.UpdateDisabled
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.updateme.ui.viewmodel.MainUiState
import com.updateme.ui.viewmodel.MainViewModel

@Composable
fun SettingsScreen(
    uiState: MainUiState,
    viewModel: MainViewModel
) {
    val context = LocalContext.current
    val settings = viewModel.settingsManager

    val themeMode by settings.themeMode.collectAsState()
    val installAfterDownload by settings.installAfterDownload.collectAsState()
    val deleteOnLeave by settings.deleteOnLeave.collectAsState()
    val installUnsafeApps by settings.installUnsafeApps.collectAsState()
    val updatesNotification by settings.updatesNotification.collectAsState()
    val newReleaseNotification by settings.newReleaseNotification.collectAsState()
    val ignoredApps by settings.ignoredApps.collectAsState()

    var showThemeDialog by remember { mutableStateOf(false) }
    var showIgnoredAppsDialog by remember { mutableStateOf(false) }
    var showUpdateMeReleaseDialog by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
            .testTag("settings_screen"),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Appearance
        SettingsSectionCard(title = "Appearance", icon = Icons.Default.Palette) {
            SettingsClickableItem(
                title = "Theme Mode",
                description = when (themeMode) {
                    "light" -> "Light Theme"
                    "dark" -> "Dark Theme"
                    else -> "Follow System Default"
                },
                onClick = { showThemeDialog = true },
                tag = "settings_theme"
            )
        }

        // Downloads
        SettingsSectionCard(title = "Downloads", icon = Icons.Default.Download) {
            SettingsSwitchItem(
                title = "Install Express",
                description = "Automatically prompt package installer once download finishes",
                checked = installAfterDownload,
                onCheckedChange = { settings.setInstallAfterDownload(it) },
                tag = "settings_install_express"
            )
            HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp))
            SettingsSwitchItem(
                title = "Fresh Start",
                description = "Delete all downloaded APKs when exiting the app",
                checked = deleteOnLeave,
                onCheckedChange = { settings.setDeleteOnLeave(it) },
                tag = "settings_fresh_start"
            )
            HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp))
            SettingsClickableItem(
                title = "Delete All Downloaded APKs",
                description = "Clean up downloaded files to free up disk space",
                onClick = { viewModel.deleteAllDownloadedFiles() },
                tag = "settings_delete_all"
            )
        }

        // Apps
        SettingsSectionCard(title = "Apps Management", icon = Icons.Default.UpdateDisabled) {
            SettingsClickableItem(
                title = "Update Dodger (Ignored Apps)",
                description = if (ignoredApps.isEmpty()) "No apps ignored" else "${ignoredApps.size} apps excluded from update checks",
                onClick = { showIgnoredAppsDialog = true },
                tag = "settings_ignored_apps"
            )
        }

        // Notifications
        SettingsSectionCard(title = "Notifications", icon = Icons.Default.Notifications) {
            SettingsSwitchItem(
                title = "Update Junkie",
                description = "Get notified when updates for installed apps are detected",
                checked = updatesNotification,
                onCheckedChange = { settings.setUpdatesNotification(it) },
                tag = "settings_updates_notif"
            )
            HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp))
            SettingsSwitchItem(
                title = "Frontline Fan",
                description = "Get notified when a new UpdateMe release is available",
                checked = newReleaseNotification,
                onCheckedChange = { settings.setNewReleaseNotification(it) },
                tag = "settings_release_notif"
            )
        }

        // Security
        SettingsSectionCard(title = "Security", icon = Icons.Default.Security) {
            SettingsSwitchItem(
                title = "Risk Taker",
                description = "Allow installing potentially unsafe APKs flagged by VirusTotal without blocking",
                checked = installUnsafeApps,
                onCheckedChange = { settings.setInstallUnsafeApps(it) },
                tag = "settings_risk_taker"
            )
        }

        // About UpdateMe
        SettingsSectionCard(title = "About", icon = Icons.Default.Info) {
            SettingsClickableItem(
                title = "UpdateMe Version",
                description = "v${MainViewModel.CURRENT_APP_VERSION} (Build 8)",
                onClick = { showUpdateMeReleaseDialog = true },
                tag = "settings_version"
            )
            HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp))
            SettingsClickableItem(
                title = "GitHub Repository",
                description = "View source code, release notes, and documentation",
                onClick = {
                    val browserIntent = Intent(
                        Intent.ACTION_VIEW,
                        Uri.parse("https://github.com/anfreire/updateMe-Mobile")
                    ).apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) }
                    context.startActivity(browserIntent)
                },
                tag = "settings_github"
            )
        }

        Spacer(modifier = Modifier.height(16.dp))
    }

    // Theme Mode Dialog
    if (showThemeDialog) {
        AlertDialog(
            onDismissRequest = { showThemeDialog = false },
            title = { Text("Choose Theme") },
            text = {
                Column {
                    listOf("system" to "System Default", "light" to "Light", "dark" to "Dark").forEach { (mode, label) ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    settings.setThemeMode(mode)
                                    showThemeDialog = false
                                }
                                .padding(vertical = 8.dp)
                        ) {
                            RadioButton(
                                selected = themeMode == mode,
                                onClick = {
                                    settings.setThemeMode(mode)
                                    showThemeDialog = false
                                }
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(label)
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showThemeDialog = false }) {
                    Text("Close")
                }
            }
        )
    }

    // Ignored Apps Dialog
    if (showIgnoredAppsDialog) {
        val appList = uiState.index.keys.sorted()
        AlertDialog(
            onDismissRequest = { showIgnoredAppsDialog = false },
            title = { Text("Update Dodger (Ignored Apps)") },
            text = {
                Column(modifier = Modifier.height(350.dp)) {
                    Text(
                        text = "Checked apps will not receive update checks or update notifications.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )
                    LazyColumn {
                        items(appList) { appName ->
                            val isIgnored = ignoredApps.contains(appName)
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { settings.toggleIgnoredApp(appName) }
                                    .padding(vertical = 4.dp)
                            ) {
                                Checkbox(
                                    checked = isIgnored,
                                    onCheckedChange = { settings.toggleIgnoredApp(appName) }
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(appName, style = MaterialTheme.typography.bodyMedium)
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showIgnoredAppsDialog = false }) {
                    Text("Done")
                }
            }
        )
    }

    // UpdateMe Release Dialog
    if (showUpdateMeReleaseDialog) {
        val release = uiState.latestAppRelease
        AlertDialog(
            onDismissRequest = { showUpdateMeReleaseDialog = false },
            title = { Text("UpdateMe Release Information") },
            text = {
                Column {
                    Text("Installed: v${MainViewModel.CURRENT_APP_VERSION}")
                    if (release != null) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            "Latest Available: v${release.version}",
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                        if (release.releaseNotes.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("Changelog:", fontWeight = FontWeight.SemiBold)
                            release.releaseNotes.forEach { note ->
                                Text("• ${note.title}: ${note.description}", style = MaterialTheme.typography.bodySmall)
                            }
                        }
                    }
                }
            },
            confirmButton = {
                if (release != null && release.download.isNotBlank()) {
                    Button(onClick = {
                        val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(release.download)).apply {
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                        context.startActivity(browserIntent)
                        showUpdateMeReleaseDialog = false
                    }) {
                        Text("Download Update")
                    }
                } else {
                    TextButton(onClick = { showUpdateMeReleaseDialog = false }) {
                        Text("OK")
                    }
                }
            },
            dismissButton = {
                TextButton(onClick = { showUpdateMeReleaseDialog = false }) {
                    Text("Close")
                }
            }
        )
    }
}

@Composable
fun SettingsSectionCard(
    title: String,
    icon: ImageVector,
    content: @Composable () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
    ) {
        Column(modifier = Modifier.padding(vertical = 12.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            content()
        }
    }
}

@Composable
fun SettingsSwitchItem(
    title: String,
    description: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    tag: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onCheckedChange(!checked) }
            .padding(horizontal = 16.dp, vertical = 10.dp)
            .testTag(tag),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(text = title, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Medium)
            Text(text = description, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        Spacer(modifier = Modifier.width(12.dp))
        Switch(checked = checked, onCheckedChange = onCheckedChange)
    }
}

@Composable
fun SettingsClickableItem(
    title: String,
    description: String,
    onClick: () -> Unit,
    tag: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 12.dp)
            .testTag(tag),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(text = title, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Medium)
            Text(text = description, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        Icon(
            imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
