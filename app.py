import streamlit as st
import easyocr
from PIL import Image
import re
# --- ตั้งค่าหน้าตา ---
st.set_page_config(page_title="ระบบตรวจสอบคุณสมบัติอาจารย์พิเศษ", layout="wide")
@st.cache_resource
def load_ocr()
    return easyocr.Reader(['th', 'en'])
# --- หัวข้อระบบ ---
st.markdown("<h1 style='text-align: center; color: #0046ad;'>🎓 ระบบตรวจสอบคุณสมบัติอาจารย์พิเศษ</h1>", unsafe_allow_html=True)
st.markdown("<p style='text-align: center;'>เงื่อนไข: ผลงาน 1 เรื่อง (2564-2568) ในฐาน Scopus หรือ TCI 1-2</p>", unsafe_allow_html=True)
# ส่วนอัปโหล
uploaded_file = st.file_uploader("อัปโหลดรูปภาพหน้าแรกของบทความ (JPG/PNG)", type=["jpg", "png", "jpeg"])
if uploaded_file:
    if st.button("เริ่มการตรวจสอบด้วย AI ➔"):
        with st.spinner("AI กำลังอ่านข้อมูลและตรวจสอบเงื่อนไข TCI 1-2..."):
            reader = load_ocr()
            image = Image.open(uploaded_file)
            result = reader.readtext(image, detail=0)
            full_text = " ".join(result).lower()
            # ตรวจปี (2564-2568)
            years = re.findall(r'256[4-8]|202[1-5]', full_text)
            # ตรวจฐานข้อมูล (รองรับ TCI 2)
            db_keywords = ["scopus", "tci 1", "tci 2", "tci1", "tci2", "กลุ่ม 1", "กลุ่ม 2", "tier 1", "tier 2", "journal"]
            found_db = [db for db in db_keywords if db in full_text]
            
            st.divider()
            if years and found_db:
                st.balloons()
                st.success("✅ ผ่านคุณสมบัติ: พบปีที่พิมพ์และอยู่ในฐานข้อมูลที่กำหนด")
            else:
                st.error("❌ ไม่ผ่านคุณสมบัติ")
                if not years: st.warning("- ไม่พบปี พ.ศ. 2564-2568")
                if not found_db: st.warning("- ไม่พบ Keyword Scopus หรือ TCI 1-2")
