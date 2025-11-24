# First, install the Supabase Python client if you haven't already:
# pip install supabase

# Optional: For a nicer tabular display, install pandas:
# pip install pandas

import os
from supabase import create_client, Client
import pandas as pd  # Optional: for better table formatting

# Set up your Supabase credentials
# Replace with your actual Supabase project URL and anon key
# You can get these from your Supabase dashboard: Settings > API
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://aanenqfgmnuosyfbfxbk.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sb_secret_rZc47DbEIZpLf2nRrnj6ZA_FImuYy0C")

# Initialize the Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Table name based on your schema
TABLE_NAME = 'scraped_articles'

# Fetch all rows from the table
response = supabase.table(TABLE_NAME).select('*').execute()

# Check if data was fetched successfully
if response.data:
    print("Scraped Articles Table Data:")
    print("-" * 100)

    # Use pandas for a formatted table display (if available)
    try:
        df = pd.DataFrame(response.data)
        print(df.to_string(index=False))
    except ImportError:
        # Fallback to manual formatting
        headers = list(response.data[0].keys())
        print("| " + " | ".join(headers) + " |")
        print("| " + " | ".join(["---"] * len(headers)) + " |")

        for row in response.data:
            print("| " + " | ".join(str(row.get(header, '')) for header in headers) + " |")

    print(f"\nTotal rows: {len(response.data)}")
else:
    print("No data found in the table or an error occurred.")
    if hasattr(response, 'error') and response.error:
        print(f"Error: {response.error}")
