package com.updateme.ui.components

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BugReport
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Fingerprint
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.TipsAndUpdates
import androidx.compose.material3.Badge
import androidx.compose.material3.DividerDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.material3.NavigationDrawerItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.updateme.ui.viewmodel.Screen

@Composable
fun AppNavigationDrawer(
    currentScreen: Screen,
    updatesCount: Int,
    activeDownloadsCount: Int,
    onNavigate: (Screen) -> Unit,
    closeDrawer: () -> Unit
) {
    val context = LocalContext.current

    ModalDrawerSheet(
        modifier = Modifier.width(300.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            // Header
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .background(MaterialTheme.colorScheme.primaryContainer, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = "UpdateMe Logo",
                        tint = MaterialTheme.colorScheme.onPrimaryContainer,
                        modifier = Modifier.size(28.dp)
                    )
                }
                Spacer(modifier = Modifier.width(16.dp))
                Column {
                    Text(
                        text = "UpdateMe",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "v3.0.0",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            HorizontalDivider(
                modifier = Modifier.padding(vertical = 8.dp),
                color = DividerDefaults.color.copy(alpha = 0.5f)
            )

            // Primary Navigation Items
            NavigationDrawerItem(
                icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                label = { Text("Apps") },
                selected = currentScreen == Screen.HOME,
                onClick = {
                    onNavigate(Screen.HOME)
                    closeDrawer()
                },
                modifier = Modifier
                    .padding(NavigationDrawerItemDefaults.ItemPadding)
                    .testTag("drawer_home")
            )

            NavigationDrawerItem(
                icon = { Icon(Icons.Default.Refresh, contentDescription = "Updates") },
                label = { Text("Updates") },
                badge = {
                    if (updatesCount > 0) {
                        Badge { Text("$updatesCount") }
                    }
                },
                selected = currentScreen == Screen.UPDATES,
                onClick = {
                    onNavigate(Screen.UPDATES)
                    closeDrawer()
                },
                modifier = Modifier
                    .padding(NavigationDrawerItemDefaults.ItemPadding)
                    .testTag("drawer_updates")
            )

            NavigationDrawerItem(
                icon = { Icon(Icons.Default.Download, contentDescription = "Downloads") },
                label = { Text("Downloads") },
                badge = {
                    if (activeDownloadsCount > 0) {
                        Badge { Text("$activeDownloadsCount") }
                    }
                },
                selected = currentScreen == Screen.DOWNLOADS,
                onClick = {
                    onNavigate(Screen.DOWNLOADS)
                    closeDrawer()
                },
                modifier = Modifier
                    .padding(NavigationDrawerItemDefaults.ItemPadding)
                    .testTag("drawer_downloads")
            )

            NavigationDrawerItem(
                icon = { Icon(Icons.Default.Fingerprint, contentDescription = "SHA-256") },
                label = { Text("SHA-256 Verifier") },
                selected = currentScreen == Screen.SHA256,
                onClick = {
                    onNavigate(Screen.SHA256)
                    closeDrawer()
                },
                modifier = Modifier
                    .padding(NavigationDrawerItemDefaults.ItemPadding)
                    .testTag("drawer_sha256")
            )

            NavigationDrawerItem(
                icon = { Icon(Icons.Default.TipsAndUpdates, contentDescription = "Tips") },
                label = { Text("Tips & Guides") },
                selected = currentScreen == Screen.TIPS || currentScreen == Screen.TIP_DETAIL,
                onClick = {
                    onNavigate(Screen.TIPS)
                    closeDrawer()
                },
                modifier = Modifier
                    .padding(NavigationDrawerItemDefaults.ItemPadding)
                    .testTag("drawer_tips")
            )

            NavigationDrawerItem(
                icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                label = { Text("Settings") },
                selected = currentScreen == Screen.SETTINGS,
                onClick = {
                    onNavigate(Screen.SETTINGS)
                    closeDrawer()
                },
                modifier = Modifier
                    .padding(NavigationDrawerItemDefaults.ItemPadding)
                    .testTag("drawer_settings")
            )

            HorizontalDivider(
                modifier = Modifier.padding(vertical = 12.dp),
                color = DividerDefaults.color.copy(alpha = 0.5f)
            )

            // Secondary Actions
            NavigationDrawerItem(
                icon = { Icon(Icons.Default.Lightbulb, contentDescription = "Suggest App") },
                label = { Text("Suggest App") },
                selected = false,
                onClick = {
                    closeDrawer()
                    val intent = Intent(
                        Intent.ACTION_VIEW,
                        Uri.parse("https://github.com/anfreire/updateMe-Scraping/issues/new?template=app-request.md")
                    ).apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) }
                    context.startActivity(intent)
                },
                modifier = Modifier
                    .padding(NavigationDrawerItemDefaults.ItemPadding)
                    .testTag("drawer_suggest")
            )

            NavigationDrawerItem(
                icon = { Icon(Icons.Default.BugReport, contentDescription = "Report Bug") },
                label = { Text("Report Issue") },
                selected = false,
                onClick = {
                    closeDrawer()
                    val intent = Intent(
                        Intent.ACTION_VIEW,
                        Uri.parse("https://github.com/anfreire/updateMe-Mobile/issues/new?template=bug_report.md")
                    ).apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) }
                    context.startActivity(intent)
                },
                modifier = Modifier
                    .padding(NavigationDrawerItemDefaults.ItemPadding)
                    .testTag("drawer_report")
            )

            NavigationDrawerItem(
                icon = { Icon(Icons.Default.Share, contentDescription = "Share") },
                label = { Text("Share UpdateMe") },
                selected = false,
                onClick = {
                    closeDrawer()
                    val sendIntent = Intent().apply {
                        action = Intent.ACTION_SEND
                        putExtra(
                            Intent.EXTRA_TEXT,
                            "Check out UpdateMe - The third-party open-source Android app manager: https://github.com/anfreire/updateMe-Mobile"
                        )
                        type = "text/plain"
                    }
                    context.startActivity(
                        Intent.createChooser(sendIntent, "Share UpdateMe").apply {
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                    )
                },
                modifier = Modifier
                    .padding(NavigationDrawerItemDefaults.ItemPadding)
                    .testTag("drawer_share")
            )

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
