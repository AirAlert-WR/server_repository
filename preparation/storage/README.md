# Configure the "storage" section of the cloud

1. After opening "Amazon S3" in your console, navigate to **Buckets for any purpose** (or similar; usually the **first entry** of the sidebar).
2. Create a new bucket called **airalertcconfigbucket**. While setting up, **DISABLE** *Blocking the whole public access**.
3. Open this bucket, go to the **Authorization** tab and replace the JSON rule with the contents of the [aasr.json](aasr.json) file, located inside this repository.
4. Save all changes.
