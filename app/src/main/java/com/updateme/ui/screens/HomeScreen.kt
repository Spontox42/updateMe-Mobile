package com.updateme.ui.screens

import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Launch
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.SecurityUpdate
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.SuggestionChip
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.updateme.data.model.ActiveDownload
import com.updateme.data.model.DownloadStatus
import com.updateme.data.model.IndexApp
import com.updateme.ui.theme.SafeGreen
import com.updateme.ui.theme.WarningOrange
import com.updateme.ui.viewmodel.MainUiState
import com.updateme.ui.viewmodel.MainViewModel

@Composable
fun HomeScreen(
    uiState: MainUiState,
    viewModel: MainViewModel,
    activeDownloads: Map<String, ActiveDownload>,
    onOpenAppDetail: (String) -> Unit
) {
    val searchTokens = uiState.searchQuery.trim().lowercase().split("\\s+".toRegex()).filter { it.isNotBlank() }

    // Filter apps based on search & category
    val filteredApps: List<Pair<String, IndexApp>> = uiState.index.entries.filter { (appName, app) ->
        val matchesCategory = if (uiState.selectedCategory == null) {
            true
        } else {
            val cat = uiState.categories[uiState.selectedCategory]
            cat?.apps?.contains(appName) == true
        }
        val matchesSearch = if (searchTokens.isEmpty()) {
            true
        } else {
            searchTokens.all { token ->
                appName.lowercase().contains(token) ||
                        app.features.any { it.lowercase().contains(token) } ||
                        app.providers.keys.any { it.lowercase().contains(token) }
            }
        }
        matchesCategory && matchesSearch
    }.map { it.key to it.value }.sortedBy { it.first }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .testTag("home_screen")
    ) {
        // Search bar
        OutlinedTextField(
            value = uiState.searchQuery,
            onValueChange = { viewModel.setSearchQuery(it) },
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp)
                .testTag("search_input"),
            placeholder = { Text("Search apps, features...") },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search") },
            trailingIcon = {
                if (uiState.searchQuery.isNotEmpty()) {
                    IconButton(onClick = { viewModel.setSearchQuery("") }) {
                        Icon(Icons.Default.Clear, contentDescription = "Clear")
                    }
                }
            },
            singleLine = true,
            shape = RoundedCornerShape(24.dp)
        )

        // Category Filter Chips
        if (uiState.categories.isNotEmpty()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = uiState.selectedCategory == null,
                    onClick = { viewModel.setSelectedCategory(null) },
                    label = { Text("All (${uiState.index.size})") },
                    modifier = Modifier.testTag("category_all")
                )
                uiState.categories.forEach { (catName, catItem) ->
                    FilterChip(
                        selected = uiState.selectedCategory == catName,
                        onClick = {
                            viewModel.setSelectedCategory(
                                if (uiState.selectedCategory == catName) null else catName
                            )
                        },
                        label = { Text("$catName (${catItem.apps.size})") },
                        modifier = Modifier.testTag("category_${catName.replace(" ", "_")}")
                    )
                }
            }
        }

        if (uiState.isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator(modifier = Modifier.size(48.dp))
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Fetching app repository...",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        } else if (filteredApps.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = null,
                        modifier = Modifier.size(64.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "No apps found matching criteria",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedButton(
                        onClick = {
                            viewModel.setSearchQuery("")
                            viewModel.setSelectedCategory(null)
                        }
                    ) {
                        Text("Reset Filters")
                    }
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filteredApps, key = { it.first }) { (appName, app) ->
                    val defaultProvider = viewModel.getEffectiveProvider(appName, app)
                    val defaultProviderName = viewModel.getEffectiveProviderName(appName, app)
                    val installedVer = uiState.installedVersions[appName]
                    val activeDownload = activeDownloads[appName]

                    AppCard(
                        appName = appName,
                        app = app,
                        installedVersion = installedVer,
                        providerName = defaultProviderName,
                        activeDownload = activeDownload,
                        onCardClick = { onOpenAppDetail(appName) },
                        onInstallClick = {
                            if (defaultProvider != null) {
                                viewModel.startDownload(appName, defaultProviderName, defaultProvider)
                            }
                        },
                        onOpenClick = {
                            if (defaultProvider != null) {
                                viewModel.packageManagerHelper.openApp(defaultProvider.packageName)
                            }
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun AppCard(
    appName: String,
    app: IndexApp,
    installedVersion: String?,
    providerName: String,
    activeDownload: ActiveDownload?,
    onCardClick: () -> Unit,
    onInstallClick: () -> Unit,
    onOpenClick: () -> Unit
) {
    val defaultProvider = app.providers[providerName] ?: app.providers.values.firstOrNull()
    val availableVersion = defaultProvider?.version ?: ""
    val hasUpdate = installedVersion != null && MainViewModel.isVersionNewer(availableVersion, installedVersion)

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onCardClick)
            .testTag("app_card_$appName"),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceContainerLow
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        shape = RoundedCornerShape(16.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // App Icon
            Surface(
                modifier = Modifier
                    .size(56.dp)
                    .clip(RoundedCornerShape(14.dp)),
                color = MaterialTheme.colorScheme.surfaceContainerHigh
            ) {
                AsyncImage(
                    model = app.icon,
                    contentDescription = "$appName icon",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            }

            Spacer(modifier = Modifier.width(14.dp))

            // App details
            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(end = 8.dp)
            ) {
                Text(
                    text = appName,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.padding(top = 2.dp)
                ) {
                    Text(
                        text = "v$availableVersion",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text("•", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.outline)
                    Text(
                        text = providerName,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.Medium
                    )
                }

                // Status chip
                Row(
                    modifier = Modifier.padding(top = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    when {
                        hasUpdate -> {
                            SuggestionChip(
                                onClick = onCardClick,
                                label = { Text("Update: $installedVersion → $availableVersion", style = MaterialTheme.typography.labelSmall) },
                                colors = AssistChipDefaults.assistChipColors(
                                    containerColor = WarningOrange.copy(alpha = 0.15f),
                                    labelColor = WarningOrange
                                ),
                                border = null,
                                modifier = Modifier.height(24.dp)
                            )
                        }
                        installedVersion != null -> {
                            SuggestionChip(
                                onClick = onCardClick,
                                label = { Text("Installed (v$installedVersion)", style = MaterialTheme.typography.labelSmall) },
                                colors = AssistChipDefaults.assistChipColors(
                                    containerColor = SafeGreen.copy(alpha = 0.15f),
                                    labelColor = SafeGreen
                                ),
                                border = null,
                                modifier = Modifier.height(24.dp)
                            )
                        }
                    }
                }
            }

            // Quick Action button
            if (activeDownload != null && activeDownload.status == DownloadStatus.DOWNLOADING) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator(
                        progress = activeDownload.progress,
                        modifier = Modifier.size(32.dp),
                        strokeWidth = 3.dp
                    )
                    Text(
                        text = "${(activeDownload.progress * 100).toInt()}%",
                        style = MaterialTheme.typography.labelSmall
                    )
                }
            } else if (hasUpdate) {
                Button(
                    onClick = onInstallClick,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = WarningOrange,
                        contentColor = Color.White
                    ),
                    shape = RoundedCornerShape(12.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                    modifier = Modifier.testTag("action_update_$appName")
                ) {
                    Icon(Icons.Default.SecurityUpdate, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Update", style = MaterialTheme.typography.labelMedium)
                }
            } else if (installedVersion != null) {
                OutlinedButton(
                    onClick = onOpenClick,
                    shape = RoundedCornerShape(12.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                    modifier = Modifier.testTag("action_open_$appName")
                ) {
                    Icon(Icons.Default.Launch, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Open", style = MaterialTheme.typography.labelMedium)
                }
            } else {
                Button(
                    onClick = onInstallClick,
                    shape = RoundedCornerShape(12.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                    modifier = Modifier.testTag("action_install_$appName")
                ) {
                    Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Install", style = MaterialTheme.typography.labelMedium)
                }
            }
        }
    }
}
