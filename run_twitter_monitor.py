#!/usr/bin/env python3
from twitter_monitor import smart_kenya_search, check_api_status

if __name__ == "__main__":
    print("🚀 Starting Twitter Monitor...")
    
    # Check if API is available
    api_ready = check_api_status()
    
    if api_ready:
        print("\n" + "="*50)
        total_threats = smart_kenya_search()
        print(f"\n📊 SCAN COMPLETE: Found {total_threats} total threats")
    else:
        print("\n💡 API rate limited. Please wait 15 minutes and try again.")