import streamlit as st
import easyocr
from PIL import Image
import re
import pandas as pd

# --- 1. ตั้งค่าหน้ากระดาษ ---
st.set_page_config(page_title="ระบบตรวจสอบคุณสมบัติอาจารย์พิเศษ", layout="wide")

# --- 2. ฟังก์ชันหลักสำหรับตรวจสอบ ---
@st.cache_resource
def load_ocr():
    # โหลด AI สำหรับอ่านภาษาไทยและอังกฤษ
    return easyocr.Reader(['th', 'en'])

def extract_years(text):
    # ค้นหาปี พ.ศ. 2564-2568 หรือ ค.ศ. 2021-2025
    years = re.findall(r'\b(256[4-8]|202[1-5])\b', text)
    valid_years = []
    for y in years:
        y_int = int(y)
        # ถ้าเป็น พ.ศ. ให้แปลงเป็น ค.ศ.
        converted = y_int if y_int < 2500 else y_int - 543
        valid_years.append(converted)
    return list(set(valid_years))

# --- 3. ส่วนการแสดงผลดีไซน์ (UI) ---

# ส่วน Header สีน้ำเงิน (เลียนแบบ Mahidol Style ตามรูปที่ 1 และ 2)
st.markdown("""
    <div style="background-color: #0046ad; padding: 25px; border-radius: 15px; text-align: center; color: white; margin-bottom: 20px;">
        <h1 style="margin: 0; font-family: sans-serif;">🎓 ระบบตรวจสอบคุณสมบัติอาจารย์พิเศษ</h1>
        <p style="margin: 5px;">ตรวจสอบผลงานตีพิมพ์ 1 เรื่อง ในรอบ 5 ปี (2564-2568)</p>
    </div>
""", unsafe_allow_html=True)

# ส่วน Stepper (จำลองขั้นตอน 1-4 ตามรูปภาพที่คุณส่งมา)
if 'step' not in st.session_state:
    st.session_state.step = 1

col_s1, col_s2, col_s3, col_s4 = st.columns(4)
steps = ["ข้อมูลหลัก", "อัปโหลดไฟล์", "ประมวลผล", "ผลตรวจสอบ"]
for i, step_name in enumerate(steps, 1):
    with [col_s1, col_s2, col_s3, col_s4][i-1]:
        color = "#0046ad" if st.session_state.step >= i else "#ddd"
        st.markdown(f"""
            <div style="text-align: center;">
                <div style="background: {color}; color: white; border-radius: 50%; width: 35px; height: 35px; 
                display: flex; align-items: center; justify-content: center; margin: 0 auto;">{i}</div>
                <div style="font-size: 12px; margin-top: 5px;">{step_name}</div>
            </div>
        """, unsafe_allow_html=True)

st.divider()

# --- ขั้นตอนที่ 1: กรอกข้อมูล (ล้อตามแบบรูป image_ddf1f0.jpg) ---
if st.session_state.step == 1:
    st.subheader("📝 ขั้นตอนที่ 1: กรอกข้อมูลเบื้องต้น")
    c1, c2 = st.columns(2)
    with c1:
        st.session_state.name_th = st.text_input("ชื่อ-นามสกุล (ภาษาไทย)", placeholder="ระบุชื่อ-นามสกุล")
        st.session_state.name_en = st.text_input("Name-Surname
