package com.updateme.data.repository

import com.updateme.data.model.AppRelease
import com.updateme.data.model.CategoryItem
import com.updateme.data.model.IndexApp
import com.updateme.data.model.TipItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import okhttp3.OkHttpClient
import okhttp3.Request
import java.util.concurrent.TimeUnit

class UpdateMeRepository {

    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }

    private var cachedIndex: Map<String, IndexApp>? = null
    private var cachedCategories: Map<String, CategoryItem>? = null
    private var cachedTips: Map<String, TipItem>? = null

    suspend fun fetchIndex(): Result<Map<String, IndexApp>> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder().url(INDEX_URL).build()
            val response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                return@withContext Result.failure(Exception("Failed to fetch index: HTTP ${response.code}"))
            }
            val body = response.body?.string() ?: return@withContext Result.failure(Exception("Empty body"))
            val parsed: Map<String, IndexApp> = json.decodeFromString(body)
            cachedIndex = parsed
            Result.success(parsed)
        } catch (e: Exception) {
            cachedIndex?.let { Result.success(it) } ?: Result.failure(e)
        }
    }

    suspend fun fetchCategories(): Result<Map<String, CategoryItem>> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder().url(CATEGORIES_URL).build()
            val response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                return@withContext Result.failure(Exception("Failed to fetch categories: HTTP ${response.code}"))
            }
            val body = response.body?.string() ?: return@withContext Result.failure(Exception("Empty body"))
            val parsed: Map<String, CategoryItem> = json.decodeFromString(body)
            cachedCategories = parsed
            Result.success(parsed)
        } catch (e: Exception) {
            cachedCategories?.let { Result.success(it) } ?: Result.failure(e)
        }
    }

    suspend fun fetchTips(): Result<Map<String, TipItem>> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder().url(TIPS_URL).build()
            val response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                return@withContext Result.failure(Exception("Failed to fetch tips: HTTP ${response.code}"))
            }
            val body = response.body?.string() ?: return@withContext Result.failure(Exception("Empty body"))
            val parsed: Map<String, TipItem> = json.decodeFromString(body)
            cachedTips = parsed
            Result.success(parsed)
        } catch (e: Exception) {
            cachedTips?.let { Result.success(it) } ?: Result.failure(e)
        }
    }

    suspend fun fetchLatestAppRelease(): Result<AppRelease> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder().url(APP_RELEASE_URL).build()
            val response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                return@withContext Result.failure(Exception("Failed to fetch release info: HTTP ${response.code}"))
            }
            val body = response.body?.string() ?: return@withContext Result.failure(Exception("Empty body"))
            val parsed: AppRelease = json.decodeFromString(body)
            Result.success(parsed)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    companion object {
        private const val INDEX_URL =
            "https://raw.githubusercontent.com/anfreire/updateMe-Data/main/index.json"
        private const val CATEGORIES_URL =
            "https://raw.githubusercontent.com/anfreire/updateMe-Data/main/categories.json"
        private const val TIPS_URL =
            "https://raw.githubusercontent.com/anfreire/updateMe-Data/main/tips.json"
        private const val APP_RELEASE_URL =
            "https://raw.githubusercontent.com/anfreire/updateMe-Data/main/app.json"
    }
}
