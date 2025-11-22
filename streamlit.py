import streamlit as st
import pandas as pd
from datetime import datetime
import subprocess
import sys

# Page config
st.set_page_config(
    page_title="GBV Scanner",
    page_icon="🛡️",
    layout="wide"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        color: #1e3a8a;
        text-align: center;
        margin-bottom: 2rem;
    }
</style>
""", unsafe_allow_html=True)

# Header
st.markdown('<div class="main-header">🛡️ GBV Threat Scanner</div>', unsafe_allow_html=True)

# Initialize session state
if 'scan_history' not in st.session_state:
    st.session_state.scan_history = []

# Sidebar
with st.sidebar:
    st.header("Scanner Controls")
    
    news_scan = st.button("📰 Scan News", use_container_width=True, type="primary")
    twitter_scan = st.button("🐦 Scan Twitter", use_container_width=True)
    
    st.divider()
    st.subheader("Recent Scans")
    
    for scan in st.session_state.scan_history[-3:][::-1]:
        status = "✅" if scan["status"] == "Completed" else "❌"
        st.write(f"{status} {scan['type']} - {scan['timestamp'].strftime('%H:%M')}")

# Main content
col1, col2 = st.columns(2)

with col1:
    st.subheader("Run Scanners")
    
    if news_scan:
        with st.spinner("Scanning news sites..."):
            try:
                result = subprocess.run([sys.executable, "enhanced_scraper.py"], 
                                      capture_output=True, text=True, timeout=300)
                
                if result.returncode == 0:
                    st.success("✅ News scan completed!")
                    st.session_state.scan_history.append({
                        "type": "News", 
                        "status": "Completed",
                        "timestamp": datetime.now()
                    })
                else:
                    st.error("❌ News scan failed!")
            except Exception as e:
                st.error(f"❌ Error: {e}")

    if twitter_scan:
        with st.spinner("Scanning Twitter..."):
            try:
                result = subprocess.run([sys.executable, "twitter_monitor.py"], 
                                      capture_output=True, text=True, timeout=300)
                
                if result.returncode == 0:
                    st.success("✅ Twitter scan completed!")
                    st.session_state.scan_history.append({
                        "type": "Twitter",
                        "status": "Completed", 
                        "timestamp": datetime.now()
                    })
                else:
                    st.error("❌ Twitter scan failed!")
            except Exception as e:
                st.error(f"❌ Error: {e}")

with col2:
    st.subheader("Quick Stats")
    
    try:
        from database.local_postgres import get_news_alerts, get_twitter_alerts
        
        news_count = len(get_news_alerts(limit=1000))
        twitter_count = len(get_twitter_alerts(limit=1000))
        
        st.metric("📰 News Alerts", news_count)
        st.metric("🐦 Twitter Alerts", twitter_count)
        
    except Exception as e:
        st.error(f"Database error: {e}")

# Database Preview
st.subheader("Recent Alerts")

tab1, tab2 = st.tabs(["News Alerts", "Twitter Alerts"])

with tab1:
    try:
        from database.local_postgres import get_news_alerts
        news_data = get_news_alerts(limit=10)
        if news_data:
            df_news = pd.DataFrame(news_data)
            st.dataframe(df_news, use_container_width=True)
        else:
            st.info("No news alerts yet")
    except Exception as e:
        st.error(f"Could not load news: {e}")

with tab2:
    try:
        from database.local_postgres import get_twitter_alerts
        twitter_data = get_twitter_alerts(limit=10)
        if twitter_data:
            df_twitter = pd.DataFrame(twitter_data)
            st.dataframe(df_twitter, use_container_width=True)
        else:
            st.info("No twitter alerts yet")
    except Exception as e:
        st.error(f"Could not load twitter: {e}")

# Footer
st.divider()
st.caption("GBV Monitor - Temporary Scanner UI")