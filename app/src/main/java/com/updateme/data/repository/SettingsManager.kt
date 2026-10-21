package com.updateme.data.repository

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONObject

class SettingsManager(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("updateme_prefs", Context.MODE_PRIVATE)

    private val _themeMode = MutableStateFlow(prefs.getString(KEY_THEME_MODE, "system") ?: "system")
    val themeMode: StateFlow<String> = _themeMode.asStateFlow()

    private val _installAfterDownload = MutableStateFlow(prefs.getBoolean(KEY_INSTALL_AFTER_DOWNLOAD, true))
    val installAfterDownload: StateFlow<Boolean> = _installAfterDownload.asStateFlow()

    private val _deleteOnLeave = MutableStateFlow(prefs.getBoolean(KEY_DELETE_ON_LEAVE, true))
    val deleteOnLeave: StateFlow<Boolean> = _deleteOnLeave.asStateFlow()

    private val _installUnsafeApps = MutableStateFlow(prefs.getBoolean(KEY_INSTALL_UNSAFE_APPS, false))
    val installUnsafeApps: StateFlow<Boolean> = _installUnsafeApps.asStateFlow()

    private val _updatesNotification = MutableStateFlow(prefs.getBoolean(KEY_UPDATES_NOTIFICATION, true))
    val updatesNotification: StateFlow<Boolean> = _updatesNotification.asStateFlow()

    private val _newReleaseNotification = MutableStateFlow(prefs.getBoolean(KEY_NEW_RELEASE_NOTIFICATION, true))
    val newReleaseNotification: StateFlow<Boolean> = _newReleaseNotification.asStateFlow()

    private val _ignoredApps = MutableStateFlow(prefs.getStringSet(KEY_IGNORED_APPS, emptySet()) ?: emptySet())
    val ignoredApps: StateFlow<Set<String>> = _ignoredApps.asStateFlow()

    private val _defaultProviders = MutableStateFlow(loadDefaultProviders())
    val defaultProviders: StateFlow<Map<String, String>> = _defaultProviders.asStateFlow()

    private val _providersOrder = MutableStateFlow(loadProvidersOrder())
    val providersOrder: StateFlow<List<String>> = _providersOrder.asStateFlow()

    fun setThemeMode(mode: String) {
        prefs.edit().putString(KEY_THEME_MODE, mode).apply()
        _themeMode.value = mode
    }

    fun setInstallAfterDownload(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_INSTALL_AFTER_DOWNLOAD, enabled).apply()
        _installAfterDownload.value = enabled
    }

    fun setDeleteOnLeave(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_DELETE_ON_LEAVE, enabled).apply()
        _deleteOnLeave.value = enabled
    }

    fun setInstallUnsafeApps(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_INSTALL_UNSAFE_APPS, enabled).apply()
        _installUnsafeApps.value = enabled
    }

    fun setUpdatesNotification(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_UPDATES_NOTIFICATION, enabled).apply()
        _updatesNotification.value = enabled
    }

    fun setNewReleaseNotification(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_NEW_RELEASE_NOTIFICATION, enabled).apply()
        _newReleaseNotification.value = enabled
    }

    fun toggleIgnoredApp(appName: String) {
        val current = _ignoredApps.value.toMutableSet()
        if (current.contains(appName)) {
            current.remove(appName)
        } else {
            current.add(appName)
        }
        prefs.edit().putStringSet(KEY_IGNORED_APPS, current).apply()
        _ignoredApps.value = current
    }

    fun setDefaultProvider(appName: String, provider: String) {
        val current = _defaultProviders.value.toMutableMap()
        current[appName] = provider
        saveDefaultProviders(current)
        _defaultProviders.value = current
    }

    fun setProvidersOrder(order: List<String>) {
        saveProvidersOrder(order)
        _providersOrder.value = order
    }

    private fun loadDefaultProviders(): Map<String, String> {
        val jsonStr = prefs.getString(KEY_DEFAULT_PROVIDERS, null) ?: return emptyMap()
        return try {
            val json = JSONObject(jsonStr)
            val map = mutableMapOf<String, String>()
            json.keys().forEach { key ->
                map[key] = json.getString(key)
            }
            map
        } catch (_: Exception) {
            emptyMap()
        }
    }

    private fun saveDefaultProviders(map: Map<String, String>) {
        val json = JSONObject(map)
        prefs.edit().putString(KEY_DEFAULT_PROVIDERS, json.toString()).apply()
    }

    private fun loadProvidersOrder(): List<String> {
        val set = prefs.getString(KEY_PROVIDERS_ORDER, null) ?: return emptyList()
        return set.split(",").filter { it.isNotBlank() }
    }

    private fun saveProvidersOrder(order: List<String>) {
        prefs.edit().putString(KEY_PROVIDERS_ORDER, order.joinToString(",")).apply()
    }

    companion object {
        private const val KEY_THEME_MODE = "theme_mode"
        private const val KEY_INSTALL_AFTER_DOWNLOAD = "install_after_download"
        private const val KEY_DELETE_ON_LEAVE = "delete_on_leave"
        private const val KEY_INSTALL_UNSAFE_APPS = "install_unsafe_apps"
        private const val KEY_UPDATES_NOTIFICATION = "updates_notification"
        private const val KEY_NEW_RELEASE_NOTIFICATION = "new_release_notification"
        private const val KEY_IGNORED_APPS = "ignored_apps"
        private const val KEY_DEFAULT_PROVIDERS = "default_providers"
        private const val KEY_PROVIDERS_ORDER = "providers_order"
    }
}
