package com.updateme.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.updateme.data.model.ActiveDownload
import com.updateme.data.model.AppRelease
import com.updateme.data.model.CategoryItem
import com.updateme.data.model.DownloadedApk
import com.updateme.data.model.IndexApp
import com.updateme.data.model.IndexAppProvider
import com.updateme.data.model.TipItem
import com.updateme.data.repository.DownloadHelper
import com.updateme.data.repository.PackageManagerHelper
import com.updateme.data.repository.SettingsManager
import com.updateme.data.repository.UpdateMeRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.io.File
import java.io.InputStream

enum class Screen {
    HOME,
    APP_DETAIL,
    UPDATES,
    DOWNLOADS,
    SHA256,
    TIPS,
    TIP_DETAIL,
    SETTINGS
}

data class UpdateItem(
    val appName: String,
    val installedVersion: String,
    val newVersion: String,
    val providerName: String,
    val provider: IndexAppProvider,
    val iconUrl: String
)

data class MainUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val currentScreen: Screen = Screen.HOME,
    val screenStack: List<Screen> = listOf(Screen.HOME),
    val searchQuery: String = "",
    val selectedCategory: String? = null,
    val categories: Map<String, CategoryItem> = emptyMap(),
    val index: Map<String, IndexApp> = emptyMap(),
    val installedVersions: Map<String, String> = emptyMap(),
    val updates: List<UpdateItem> = emptyList(),
    val selectedAppTitle: String? = null,
    val selectedTipTitle: String? = null,
    val tips: Map<String, TipItem> = emptyMap(),
    val downloadedFiles: List<DownloadedApk> = emptyList(),
    val latestAppRelease: AppRelease? = null,
    val newReleaseDialogVisible: Boolean = false,
    val toastMessage: String? = null
)

class MainViewModel(application: Application) : AndroidViewModel(application) {

    val repository = UpdateMeRepository()
    val packageManagerHelper = PackageManagerHelper(application)
    val downloadHelper = DownloadHelper(application)
    val settingsManager = SettingsManager(application)

    private val _uiState = MutableStateFlow(MainUiState())
    val uiState: StateFlow<MainUiState> = _uiState.asStateFlow()

    val activeDownloads = downloadHelper.activeDownloads

    init {
        loadData()
        refreshDownloadedFiles()
    }

    fun loadData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            refreshAll()
            _uiState.value = _uiState.value.copy(isLoading = false)
        }
    }

    fun refreshAll() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isRefreshing = true)

            val indexResult = repository.fetchIndex()
            val categoriesResult = repository.fetchCategories()
            val tipsResult = repository.fetchTips()
            val releaseResult = repository.fetchLatestAppRelease()

            val index = indexResult.getOrDefault(_uiState.value.index)
            val categories = categoriesResult.getOrDefault(_uiState.value.categories)
            val tips = tipsResult.getOrDefault(_uiState.value.tips)
            val release = releaseResult.getOrNull()

            val installed = mutableMapOf<String, String>()
            index.forEach { (appName, app) ->
                val preferredProvider = getEffectiveProvider(appName, app)
                if (preferredProvider != null) {
                    val ver = packageManagerHelper.getInstalledVersion(preferredProvider.packageName)
                    if (ver != null) {
                        installed[appName] = ver
                    }
                }
            }

            val updates = computeUpdates(index, installed, settingsManager.ignoredApps.value)

            val isNewRelease = release != null && isVersionNewer(release.version, CURRENT_APP_VERSION)

            _uiState.value = _uiState.value.copy(
                isRefreshing = false,
                index = index,
                categories = categories,
                tips = tips,
                installedVersions = installed,
                updates = updates,
                latestAppRelease = release,
                newReleaseDialogVisible = isNewRelease && settingsManager.newReleaseNotification.value
            )
            refreshDownloadedFiles()
        }
    }

    fun refreshInstalledVersions() {
        val index = _uiState.value.index
        val installed = mutableMapOf<String, String>()
        index.forEach { (appName, app) ->
            val provider = getEffectiveProvider(appName, app)
            if (provider != null) {
                val ver = packageManagerHelper.getInstalledVersion(provider.packageName)
                if (ver != null) {
                    installed[appName] = ver
                }
            }
        }
        val updates = computeUpdates(index, installed, settingsManager.ignoredApps.value)
        _uiState.value = _uiState.value.copy(
            installedVersions = installed,
            updates = updates
        )
    }

    fun getEffectiveProvider(appName: String, app: IndexApp): IndexAppProvider? {
        val defaultProviderName = settingsManager.defaultProviders.value[appName]
        if (defaultProviderName != null && app.providers.containsKey(defaultProviderName)) {
            return app.providers[defaultProviderName]
        }
        val priorityOrder = settingsManager.providersOrder.value
        for (providerName in priorityOrder) {
            if (app.providers.containsKey(providerName)) {
                return app.providers[providerName]
            }
        }
        return app.providers.values.firstOrNull()
    }

    fun getEffectiveProviderName(appName: String, app: IndexApp): String {
        val defaultProviderName = settingsManager.defaultProviders.value[appName]
        if (defaultProviderName != null && app.providers.containsKey(defaultProviderName)) {
            return defaultProviderName
        }
        val priorityOrder = settingsManager.providersOrder.value
        for (p in priorityOrder) {
            if (app.providers.containsKey(p)) {
                return p
            }
        }
        return app.providers.keys.firstOrNull() ?: ""
    }

    private fun computeUpdates(
        index: Map<String, IndexApp>,
        installedVersions: Map<String, String>,
        ignoredApps: Set<String>
    ): List<UpdateItem> {
        val list = mutableListOf<UpdateItem>()
        index.forEach { (appName, app) ->
            if (!ignoredApps.contains(appName)) {
                val currentVersion = installedVersions[appName]
                val provider = getEffectiveProvider(appName, app)
                val providerName = getEffectiveProviderName(appName, app)
                if (currentVersion != null && provider != null) {
                    if (isVersionNewer(provider.version, currentVersion)) {
                        list.add(
                            UpdateItem(
                                appName = appName,
                                installedVersion = currentVersion,
                                newVersion = provider.version,
                                providerName = providerName,
                                provider = provider,
                                iconUrl = app.icon
                            )
                        )
                    }
                }
            }
        }
        return list
    }

    fun navigateTo(screen: Screen) {
        val stack = _uiState.value.screenStack.toMutableList()
        if (screen == Screen.HOME) {
            _uiState.value = _uiState.value.copy(
                currentScreen = Screen.HOME,
                screenStack = listOf(Screen.HOME)
            )
        } else {
            stack.add(screen)
            _uiState.value = _uiState.value.copy(
                currentScreen = screen,
                screenStack = stack
            )
        }
    }

    fun navigateBack(): Boolean {
        val stack = _uiState.value.screenStack.toMutableList()
        if (stack.size > 1) {
            stack.removeAt(stack.size - 1)
            val prev = stack.last()
            _uiState.value = _uiState.value.copy(
                currentScreen = prev,
                screenStack = stack
            )
            return true
        }
        return false
    }

    fun openAppDetail(appName: String) {
        _uiState.value = _uiState.value.copy(selectedAppTitle = appName)
        navigateTo(Screen.APP_DETAIL)
    }

    fun openTipDetail(tipTitle: String) {
        _uiState.value = _uiState.value.copy(selectedTipTitle = tipTitle)
        navigateTo(Screen.TIP_DETAIL)
    }

    fun setSearchQuery(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
    }

    fun setSelectedCategory(category: String?) {
        _uiState.value = _uiState.value.copy(selectedCategory = category)
    }

    fun dismissNewReleaseDialog() {
        _uiState.value = _uiState.value.copy(newReleaseDialogVisible = false)
    }

    fun showToast(message: String) {
        _uiState.value = _uiState.value.copy(toastMessage = message)
    }

    fun clearToast() {
        _uiState.value = _uiState.value.copy(toastMessage = null)
    }

    fun startDownload(
        appName: String,
        providerName: String,
        provider: IndexAppProvider
    ) {
        val autoInstall = settingsManager.installAfterDownload.value
        viewModelScope.launch {
            showToast("Downloading $appName...")
            val result = downloadHelper.downloadApk(
                appName = appName,
                providerName = providerName,
                downloadUrl = provider.download,
                version = provider.version,
                autoInstall = autoInstall
            )
            refreshDownloadedFiles()
            refreshInstalledVersions()
            if (result.isSuccess) {
                showToast("$appName download completed")
            } else {
                showToast("Failed to download $appName")
            }
        }
    }

    fun updateAll() {
        val updates = _uiState.value.updates
        updates.forEach { item ->
            startDownload(item.appName, item.providerName, item.provider)
        }
    }

    fun cancelDownload(appName: String) {
        downloadHelper.cancelDownload(appName)
    }

    fun refreshDownloadedFiles() {
        _uiState.value = _uiState.value.copy(
            downloadedFiles = downloadHelper.getDownloadedFiles()
        )
    }

    fun installApk(file: File) {
        downloadHelper.installApk(file)
    }

    fun shareApk(file: File) {
        downloadHelper.shareApk(file)
    }

    fun deleteDownloadedFile(file: File) {
        downloadHelper.deleteFile(file)
        refreshDownloadedFiles()
    }

    fun deleteAllDownloadedFiles() {
        val deleted = downloadHelper.deleteAllFiles()
        refreshDownloadedFiles()
        showToast("Deleted $deleted APK files")
    }

    suspend fun calculateSha256(file: File): String {
        return downloadHelper.calculateSha256(file)
    }

    suspend fun calculateSha256(inputStream: InputStream): String {
        return downloadHelper.calculateSha256(inputStream)
    }

    companion object {
        const val CURRENT_APP_VERSION = "3.0.0"

        fun isVersionNewer(newVer: String, currentVer: String): Boolean {
            if (newVer == currentVer) return false
            val newParts = newVer.split(".", "-", "_").mapNotNull { it.toIntOrNull() }
            val curParts = currentVer.split(".", "-", "_").mapNotNull { it.toIntOrNull() }
            val length = maxOf(newParts.size, curParts.size)
            for (i in 0 until length) {
                val n = newParts.getOrElse(i) { 0 }
                val c = curParts.getOrElse(i) { 0 }
                if (n > c) return true
                if (n < c) return false
            }
            return newVer > currentVer
        }
    }
}
