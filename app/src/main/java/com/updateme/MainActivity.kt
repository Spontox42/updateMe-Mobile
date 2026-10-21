package com.updateme

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.SystemUpdate
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.updateme.data.model.DownloadedApk
import com.updateme.ui.components.AppNavigationDrawer
import com.updateme.ui.screens.AppDetailScreen
import com.updateme.ui.screens.DownloadsScreen
import com.updateme.ui.screens.HomeScreen
import com.updateme.ui.screens.SettingsScreen
import com.updateme.ui.screens.Sha256Screen
import com.updateme.ui.screens.TipDetailScreen
import com.updateme.ui.screens.TipsScreen
import com.updateme.ui.screens.UpdatesScreen
import com.updateme.ui.theme.UpdateMeTheme
import com.updateme.ui.viewmodel.MainViewModel
import com.updateme.ui.viewmodel.Screen
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            val themeMode by viewModel.settingsManager.themeMode.collectAsState()

            UpdateMeTheme(themePreference = themeMode) {
                UpdateMeApp(viewModel = viewModel)
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        if (viewModel.settingsManager.deleteOnLeave.value) {
            viewModel.downloadHelper.deleteAllFiles()
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UpdateMeApp(viewModel: MainViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    val activeDownloads by viewModel.activeDownloads.collectAsState()
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }

    var sha256TargetApk by remember { mutableStateOf<DownloadedApk?>(null) }

    // Toast message handling
    LaunchedEffect(uiState.toastMessage) {
        val msg = uiState.toastMessage
        if (msg != null) {
            snackbarHostState.showSnackbar(msg)
            viewModel.clearToast()
        }
    }

    // Back handling
    BackHandler(enabled = drawerState.isOpen || uiState.screenStack.size > 1) {
        if (drawerState.isOpen) {
            scope.launch { drawerState.close() }
        } else {
            viewModel.navigateBack()
        }
    }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            AppNavigationDrawer(
                currentScreen = uiState.currentScreen,
                updatesCount = uiState.updates.size,
                activeDownloadsCount = activeDownloads.size,
                onNavigate = { screen ->
                    viewModel.navigateTo(screen)
                },
                closeDrawer = {
                    scope.launch { drawerState.close() }
                }
            )
        }
    ) {
        val isRootScreen = uiState.currentScreen == Screen.HOME

        Scaffold(
            topBar = {
                // Top App Bar for root and sub-screens
                if (uiState.currentScreen != Screen.APP_DETAIL && uiState.currentScreen != Screen.TIP_DETAIL) {
                    TopAppBar(
                        title = {
                            Text(
                                text = when (uiState.currentScreen) {
                                    Screen.HOME -> "UpdateMe"
                                    Screen.UPDATES -> "App Updates"
                                    Screen.DOWNLOADS -> "Downloads"
                                    Screen.SHA256 -> "SHA-256 Verifier"
                                    Screen.TIPS -> "Tips & Guides"
                                    Screen.SETTINGS -> "Settings"
                                    else -> "UpdateMe"
                                },
                                fontWeight = FontWeight.Bold
                            )
                        },
                        navigationIcon = {
                            if (isRootScreen) {
                                IconButton(
                                    onClick = { scope.launch { drawerState.open() } },
                                    modifier = Modifier.testTag("nav_menu_button")
                                ) {
                                    Icon(Icons.Default.Menu, contentDescription = "Menu")
                                }
                            } else {
                                IconButton(
                                    onClick = { viewModel.navigateBack() },
                                    modifier = Modifier.testTag("nav_back_button")
                                ) {
                                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                                }
                            }
                        },
                        actions = {
                            if (isRootScreen || uiState.currentScreen == Screen.UPDATES) {
                                IconButton(
                                    onClick = { viewModel.refreshAll() },
                                    modifier = Modifier.testTag("refresh_button")
                                ) {
                                    Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                                }
                            }
                        },
                        colors = TopAppBarDefaults.topAppBarColors(
                            containerColor = MaterialTheme.colorScheme.surface
                        )
                    )
                }
            },
            snackbarHost = { SnackbarHost(snackbarHostState) },
            contentWindowInsets = WindowInsets(0, 0, 0, 0)
        ) { paddingValues ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            ) {
                when (uiState.currentScreen) {
                    Screen.HOME -> {
                        HomeScreen(
                            uiState = uiState,
                            viewModel = viewModel,
                            activeDownloads = activeDownloads,
                            onOpenAppDetail = { appName -> viewModel.openAppDetail(appName) }
                        )
                    }
                    Screen.APP_DETAIL -> {
                        AppDetailScreen(
                            appName = uiState.selectedAppTitle ?: "",
                            uiState = uiState,
                            viewModel = viewModel,
                            activeDownloads = activeDownloads,
                            onBack = { viewModel.navigateBack() },
                            onNavigateToApp = { appName -> viewModel.openAppDetail(appName) }
                        )
                    }
                    Screen.UPDATES -> {
                        UpdatesScreen(
                            uiState = uiState,
                            viewModel = viewModel,
                            activeDownloads = activeDownloads,
                            onOpenAppDetail = { appName -> viewModel.openAppDetail(appName) }
                        )
                    }
                    Screen.DOWNLOADS -> {
                        DownloadsScreen(
                            uiState = uiState,
                            viewModel = viewModel,
                            activeDownloads = activeDownloads,
                            onVerifySha256 = { apk ->
                                sha256TargetApk = apk
                                viewModel.navigateTo(Screen.SHA256)
                            }
                        )
                    }
                    Screen.SHA256 -> {
                        Sha256Screen(
                            uiState = uiState,
                            viewModel = viewModel,
                            initialApk = sha256TargetApk
                        )
                    }
                    Screen.TIPS -> {
                        TipsScreen(
                            uiState = uiState,
                            viewModel = viewModel,
                            onOpenTipDetail = { tipTitle -> viewModel.openTipDetail(tipTitle) }
                        )
                    }
                    Screen.TIP_DETAIL -> {
                        TipDetailScreen(
                            tipTitle = uiState.selectedTipTitle ?: "",
                            uiState = uiState,
                            onBack = { viewModel.navigateBack() }
                        )
                    }
                    Screen.SETTINGS -> {
                        SettingsScreen(
                            uiState = uiState,
                            viewModel = viewModel
                        )
                    }
                }
            }
        }
    }

    // New UpdateMe Release Notification Dialog
    if (uiState.newReleaseDialogVisible && uiState.latestAppRelease != null) {
        val release = uiState.latestAppRelease!!
        AlertDialog(
            onDismissRequest = { viewModel.dismissNewReleaseDialog() },
            icon = { Icon(Icons.Default.SystemUpdate, contentDescription = null, tint = MaterialTheme.colorScheme.primary) },
            title = { Text("UpdateMe v${release.version} Available!") },
            text = {
                androidx.compose.foundation.layout.Column {
                    Text("A new release of UpdateMe is ready for download.")
                    if (release.releaseNotes.isNotEmpty()) {
                        androidx.compose.foundation.layout.Spacer(modifier = Modifier.padding(top = 8.dp))
                        Text("What's new:", fontWeight = FontWeight.Bold)
                        release.releaseNotes.forEach { note ->
                            Text("• ${note.title}: ${note.description}", style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            },
            confirmButton = {
                val context = androidx.compose.ui.platform.LocalContext.current
                Button(onClick = {
                    if (release.download.isNotBlank()) {
                        val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(release.download)).apply {
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                        context.startActivity(browserIntent)
                    }
                    viewModel.dismissNewReleaseDialog()
                }) {
                    Text("Download")
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.dismissNewReleaseDialog() }) {
                    Text("Later")
                }
            }
        )
    }
}
