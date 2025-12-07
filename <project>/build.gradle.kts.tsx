plugins {
    id("com.android.application")

    // Add the ID of the plugin
    id("FIREBASE_PLUGIN_ID")
    ...
    id("com.google.gms.google-services")
    implementation(platform("com.google.firebase:firebase-bom:34.6.0"))
    implementation("com.google.firebase:firebase-analytics")