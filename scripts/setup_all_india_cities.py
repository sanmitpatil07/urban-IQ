"""
Setup full metropolitan datasets and train Physics-Informed ML models for All-India cities.
Covers entire metropolitan regions:
- Mumbai Metropolitan Region (MMR: Mumbai + Thane + Kalyan-Dombivli + Navi Mumbai + Mira-Bhayandar + Vasai-Virar)
- Pune Metropolitan Region (PMRDA: Pune + PCMC + Hinjawadi + Chakan + Talegaon + Wagholi)
- Delhi National Capital Region (NCR: Delhi + Gurugram/Manesar + Noida/Gr. Noida + Ghaziabad + Faridabad)
- Bengaluru Metropolitan Region (BMRDA: Bengaluru + Electronic City + Whitefield + Devanahalli + Peenya)
- Hyderabad Metropolitan Region (HMDA: Hyderabad + Cyberabad + Shamshabad + Patancheru + Medchal)
- Ahmedabad-Gandhinagar Twin Metro (AUDA: Ahmedabad + Gandhinagar + GIFT City + Sanand)
- Chennai Metropolitan Area (CMDA: Chennai + Tambaram + Avadi + OMR/Siruseri + Sriperumbudur)
- Kolkata Metropolitan Area (KMDA: Kolkata + Howrah + Salt Lake + New Town + Barrackpore)
- Jaipur Development Authority (JDA: Jaipur + Mansarovar + Sitapura + Bagru + Amer)
- Lucknow Development Authority (LDA: Lucknow + Gomti Nagar + Charbagh + Mohanlalganj + Chinhat)
"""

import json
from pathlib import Path
import numpy as np
import geopandas as gpd
from shapely.geometry import Polygon, Point, box
from scipy.spatial import Voronoi

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))
from urban_heat.model import UrbanHeatModel
from urban_heat.utils import processed_dir

METROPOLITAN_CITIES = {
    "mumbai": {
        "name": "Mumbai",
        "state": "Maharashtra",
        "center": [72.93, 19.15],
        # Full MMR Bounding Box from Colaba to Vasai-Virar (N-S) and Arabian Sea to Kalyan/Panvel (W-E)
        "bbox": [72.75, 18.88, 73.20, 19.45],
        "baseline_temp": 32.5,
        "wards": [
            # Mumbai City & Island
            ("MUM-01", "Colaba & Fort", "Heritage Commercial", 72.83, 18.92, 35.8, 0.12, 110000, 28, 72),
            ("MUM-02", "Marine Drive & Nariman Pt", "Financial CBD", 72.82, 18.93, 34.9, 0.14, 85000, 22, 95),
            ("MUM-03", "Malabar Hill & Walkeshwar", "Coastal Ridge", 72.80, 18.95, 33.2, 0.32, 60000, 18, 45),
            ("MUM-04", "Byculla & Mazgaon", "High-Density Residential", 72.84, 18.97, 36.4, 0.10, 160000, 48, 68),
            ("MUM-05", "Dadar & Shivaji Park", "Central Transit Hub", 72.84, 19.02, 35.2, 0.20, 140000, 36, 75),
            ("MUM-06", "Worli & Lower Parel", "Commercial Redevelopment", 72.82, 19.00, 36.8, 0.11, 130000, 34, 110),
            ("MUM-07", "Bandra West & Bandstand", "Coastal Urban", 72.83, 19.05, 34.5, 0.22, 120000, 24, 70),
            ("MUM-08", "BKC (Bandra-Kurla)", "Major Financial Center", 72.86, 19.06, 37.6, 0.09, 90000, 30, 140),
            ("MUM-09", "Dharavi & Sion", "High-Density Microclimate", 72.86, 19.04, 38.4, 0.07, 280000, 62, 85),
            ("MUM-10", "Kurla & Chunabhatti", "Transit Nexus", 72.88, 19.07, 37.1, 0.11, 210000, 52, 78),
            ("MUM-11", "Juhu & Vile Parle", "Coastal Residential", 72.83, 19.10, 34.1, 0.24, 150000, 26, 82),
            ("MUM-12", "Andheri East (MIDC/SEEPZ)", "Industrial Corridor", 72.87, 19.12, 38.2, 0.08, 220000, 44, 135),
            ("MUM-13", "Andheri West & Lokhandwala", "Commercial Residential", 72.83, 19.14, 35.4, 0.16, 240000, 32, 92),
            ("MUM-14", "Powai & IIT Campus", "Lakefront Mixed", 72.90, 19.12, 34.0, 0.35, 140000, 25, 78),
            ("MUM-15", "Goregaon East & Film City", "Green Flank", 72.86, 19.16, 34.8, 0.30, 180000, 35, 84),
            ("MUM-16", "Malad & Mindspace IT", "Commercial IT Park", 72.84, 19.18, 36.9, 0.12, 230000, 38, 115),
            ("MUM-17", "Kandivali Industrial", "Industrial Heavy", 72.85, 19.20, 37.4, 0.10, 210000, 42, 98),
            ("MUM-18", "Borivali & SGNP Border", "National Park Buffer", 72.86, 19.23, 33.6, 0.38, 190000, 28, 64),
            ("MUM-19", "Chembur & Govandi", "Industrial Refinery Flank", 72.90, 19.05, 37.9, 0.10, 250000, 56, 105),
            ("MUM-20", "Mulund West & Foothills", "Residential Foothills", 72.95, 19.17, 34.2, 0.28, 180000, 29, 68),
            
            # Thane Municipal Corporation (TMC)
            ("THN-01", "Thane West (Naupada/Station)", "Historic Transit Core", 72.97, 19.19, 36.5, 0.14, 210000, 36, 85),
            ("THN-02", "Thane Wagle Industrial Estate", "Heavy Industrial Hub", 72.94, 19.19, 38.6, 0.08, 170000, 48, 120),
            ("THN-03", "Thane Majiwada & Viviana", "High-Rise Commercial", 72.98, 19.21, 36.8, 0.15, 190000, 30, 95),
            ("THN-04", "Thane Ghodbunder Road", "Growth Mega Corridor", 72.95, 19.26, 36.2, 0.22, 230000, 28, 90),
            ("THN-05", "Kalwa & Mumbra Flank", "Dense Riverine Industrial", 73.00, 19.18, 38.0, 0.09, 240000, 58, 88),
            
            # Kalyan-Dombivli Municipal Corporation (KDMC)
            ("KDMC-01", "Kalyan West & Khadakpada", "Major Eastern Urban Hub", 73.13, 19.24, 37.4, 0.15, 260000, 42, 92),
            ("KDMC-02", "Kalyan East & Station Corridor", "High-Density Rail Hub", 73.14, 19.23, 38.1, 0.09, 270000, 52, 96),
            ("KDMC-03", "Dombivli East & MIDC Industrial", "Chemical & Industrial Cluster", 73.10, 19.21, 39.2, 0.06, 240000, 50, 130),
            ("KDMC-04", "Dombivli West & Retibunder", "Riverine Residential", 73.08, 19.22, 36.6, 0.16, 210000, 38, 78),
            ("KDMC-05", "Ulhasnagar Industrial & Market", "Dense Commercial Manufacturing", 73.15, 19.22, 38.9, 0.07, 250000, 54, 110),
            ("KDMC-06", "Ambernath MIDC Industrial Basin", "Heavy Chemical Engineering", 73.19, 19.20, 39.8, 0.05, 180000, 55, 135),
            
            # Navi Mumbai (NMMC)
            ("NMM-01", "Vashi & Palm Beach Road", "Navi Mumbai Commercial Gate", 72.99, 19.07, 35.8, 0.18, 190000, 24, 90),
            ("NMM-02", "Nerul & Seawoods Grand Central", "Planned Transit Commercial", 73.02, 19.03, 35.2, 0.24, 210000, 26, 85),
            ("NMM-03", "Belapur CBD & Government Core", "Administrative Financial", 73.04, 19.01, 35.0, 0.26, 150000, 22, 80),
            ("NMM-04", "Kharghar & Central Park Sector", "Educational Residential", 73.07, 19.03, 34.6, 0.28, 220000, 25, 82),
            ("NMM-05", "Panvel & Airport Influence Zone", "Major Logistics Nexus", 73.11, 18.99, 37.2, 0.16, 250000, 40, 115),
            ("NMM-06", "Airoli Mindspace & Knowledge Park", "IT Corridor North", 72.99, 19.15, 36.8, 0.14, 180000, 28, 125),
            ("NMM-07", "Mahape Millennium Business Park", "Electronic IT MIDC", 73.02, 19.11, 37.8, 0.10, 160000, 32, 130),
            ("NMM-08", "Taloja MIDC Industrial Strip", "Heavy Chemical & Steel Basin", 73.11, 19.05, 40.2, 0.05, 140000, 60, 150),
            
            # Mira-Bhayandar & Vasai-Virar
            ("MBR-01", "Mira Road (Shanti Nagar/Silver)", "Dense Northern Suburb", 72.86, 19.28, 36.8, 0.14, 280000, 42, 85),
            ("MBR-02", "Bhayandar Industrial & Coastal", "Salt Pan & Manufacturing", 72.85, 19.30, 37.5, 0.12, 220000, 46, 92),
            ("VVMC-01", "Vasai West & Historical Coast", "Coastal Agrarian Urban", 72.81, 19.36, 34.2, 0.28, 230000, 34, 75),
            ("VVMC-02", "Virar East & West (MMR North)", "Far Northern Commuter Hub", 72.80, 19.45, 35.2, 0.22, 270000, 38, 80),
        ]
    },
    "pune": {
        "name": "Pune",
        "state": "Maharashtra",
        "center": [73.8567, 18.5500],
        # Full PMRDA Bounding Box (Talegaon & Chakan to Katraj, Pirangut to Wagholi/Manjri)
        "bbox": [73.65, 18.35, 74.05, 18.78],
        "baseline_temp": 33.0,
        "wards": [
            # Pune Municipal Corporation (PMC Core)
            ("PUN-01", "Shivajinagar & FC Road", "Academic & Commercial Core", 73.84, 18.53, 36.4, 0.18, 120000, 28, 85),
            ("PUN-02", "Deccan Gymkhana & Kothrud", "Dense Residential West", 73.81, 18.50, 35.8, 0.22, 190000, 26, 75),
            ("PUN-03", "Pune Station & Camp", "Cantonment & Transit Core", 73.87, 18.52, 37.2, 0.14, 160000, 38, 88),
            ("PUN-04", "Swargate & Parvati", "Southern Transit Gateway", 73.86, 18.50, 37.6, 0.12, 170000, 42, 82),
            ("PUN-05", "Hadapsar & Magarpatta City", "IT Township Core", 73.93, 18.51, 37.4, 0.18, 220000, 30, 120),
            ("PUN-06", "Viman Nagar & Airport Area", "Aero Commercial Tech", 73.91, 18.56, 36.8, 0.16, 180000, 25, 105),
            ("PUN-07", "Kalyani Nagar & Koregaon Park", "Riverfront Mixed Green", 73.90, 18.54, 34.6, 0.32, 130000, 20, 78),
            ("PUN-08", "Katraj & Snake Park Flank", "Southern Hillside Basin", 73.86, 18.45, 35.2, 0.28, 180000, 38, 70),
            ("PUN-09", "Aundh & Baner Corridor", "High-Growth Commercial", 73.79, 18.56, 35.6, 0.22, 190000, 24, 90),
            ("PUN-10", "Bavdhan & Chandani Chowk", "Western Hill Foothills", 73.77, 18.51, 34.2, 0.34, 140000, 22, 65),
            ("PUN-11", "Kharadi & EON Free Zone", "Major Eastern IT Park", 73.95, 18.55, 37.8, 0.12, 210000, 28, 135),
            ("PUN-12", "Wagholi & Kesnand Road", "Rapid Growth Corridor", 73.98, 18.58, 38.2, 0.10, 190000, 36, 85),
            ("PUN-13", "Dhayari & Sinhagad Road", "Southwest River Valley", 73.81, 18.44, 35.8, 0.24, 170000, 38, 68),
            ("PUN-14", "Undri, Pisoli & Handewadi", "Southeast Suburban Hub", 73.91, 18.46, 36.5, 0.20, 160000, 35, 72),
            ("PUN-15", "Pirangut Industrial Valley", "Western Industrial Corridor", 73.68, 18.51, 37.9, 0.14, 110000, 45, 95),

            # Pimpri-Chinchwad Municipal Corporation (PCMC)
            ("PCMC-01", "Pimpri Central & Market", "High-Density Civic Core", 73.80, 18.62, 37.8, 0.11, 220000, 44, 88),
            ("PCMC-02", "Chinchwad Station & MIDC", "Manufacturing & Heavy Auto", 73.79, 18.63, 38.8, 0.08, 240000, 48, 140),
            ("PCMC-03", "Bhosari Industrial Hub (MIDC)", "Heavy Engineering Cluster", 73.84, 18.62, 39.5, 0.06, 210000, 52, 160),
            ("PCMC-04", "Nigdi & Pradhikaran Sectors", "Planned Residential Green", 73.77, 18.66, 34.8, 0.28, 190000, 26, 75),
            ("PCMC-05", "Akurdi & D.Y. Patil Campus", "Academic Industrial Transition", 73.78, 18.64, 36.2, 0.20, 170000, 32, 80),
            ("PCMC-06", "Wakad & Datta Mandir Road", "Booming Residential West", 73.76, 18.60, 36.4, 0.18, 230000, 26, 95),
            ("PCMC-07", "Pimple Saudagar & Nilakh", "Linear Riverfront Suburb", 73.79, 18.59, 35.8, 0.22, 180000, 24, 85),
            ("PCMC-08", "Ravet & Kiwale Expressway", "Mumbai-Pune Express Gate", 73.73, 18.65, 36.0, 0.22, 160000, 28, 82),
            ("PCMC-09", "Moshi & Alandi Road Terminal", "Northern Logistics Center", 73.86, 18.67, 37.9, 0.14, 180000, 42, 88),
            ("PCMC-10", "Dighi & Charholi Budruk", "Cantonment & Hill Buffer", 73.87, 18.61, 35.2, 0.26, 140000, 34, 65),

            # Hinjawadi Rajiv Gandhi Infotech Park
            ("HINJ-01", "Hinjawadi Phase 1 Tech Hub", "Mega IT Campus Park", 73.73, 18.59, 37.4, 0.12, 150000, 22, 150),
            ("HINJ-02", "Hinjawadi Phase 2 & Wipro", "Global Tech SEZ", 73.71, 18.58, 36.8, 0.16, 130000, 20, 135),
            ("HINJ-03", "Hinjawadi Phase 3 Megapolis", "High-Density Tech Living", 73.68, 18.58, 36.2, 0.20, 140000, 22, 115),
            ("HINJ-04", "Punawale & Marunji Corridor", "Hinjawadi Residential Feeder", 73.74, 18.62, 36.5, 0.18, 160000, 28, 80),

            # Chakan & Talegaon Major Industrial Growth Corridors
            ("CHK-01", "Chakan Auto Cluster Phase 1-4", "Automobile Mega Hub", 73.85, 18.75, 40.2, 0.05, 170000, 56, 180),
            ("TLG-01", "Talegaon Dabhade & MIDC", "Industrial Logistics Basin", 73.68, 18.73, 37.8, 0.16, 150000, 44, 120),
        ]
    },
    "delhi": {
        "name": "Delhi NCR",
        "state": "Delhi",
        "center": [77.2090, 28.5800],
        # Full NCR Bounding Box covering Delhi, Gurgaon, Manesar, Noida, Greater Noida, Ghaziabad, Faridabad
        "bbox": [76.85, 28.30, 77.58, 28.85],
        "baseline_temp": 34.0,
        "wards": [
            # Delhi Core
            ("DEL-01", "Connaught Place & CBD", "Central Commercial", 77.22, 28.63, 38.5, 0.12, 75000, 22, 120),
            ("DEL-02", "Chanakyapuri & Lutyens", "Diplomatic Green Enclave", 77.19, 28.59, 34.1, 0.42, 50000, 14, 45),
            ("DEL-03", "Karol Bagh & Old Delhi", "Historic Dense Core", 77.20, 28.65, 39.2, 0.07, 260000, 58, 92),
            ("DEL-04", "Rohini & Pitampura", "Northwest Sub-City", 77.12, 28.71, 37.5, 0.14, 240000, 36, 88),
            ("DEL-05", "Dwarka Sub-City 1-24", "Major Planned Sub-City", 77.05, 28.58, 36.5, 0.20, 260000, 28, 88),
            ("DEL-06", "Hauz Khas & Green Park", "Urban Village Green", 77.20, 28.55, 35.8, 0.25, 130000, 26, 72),
            ("DEL-07", "Okhla Industrial Phase 1-3", "Heavy Industrial Basin", 77.27, 28.53, 40.2, 0.05, 160000, 52, 155),
            ("DEL-08", "Mayur Vihar & Laxmi Nagar", "East Trans-Yamuna", 77.29, 28.61, 37.8, 0.14, 250000, 46, 85),
            ("DEL-09", "Shahdara & Seelampur", "High-Density Microzone", 77.28, 28.67, 39.8, 0.06, 290000, 64, 84),
            ("DEL-10", "Narela & Bawana Industrial", "Outlying Industrial Basin", 77.10, 28.78, 40.6, 0.07, 180000, 56, 130),
            
            # Gurugram / Gurgaon (Haryana NCR)
            ("GGN-01", "Cyber City & DLF Phase 1-3", "Global IT Hub", 77.09, 28.49, 38.6, 0.12, 190000, 24, 150),
            ("GGN-02", "Golf Course Road & Horizon", "Ultra-High Rise Corridor", 77.10, 28.46, 36.8, 0.20, 160000, 18, 130),
            ("GGN-03", "Sohna Road & Subhash Chowk", "Southern Commercial Hub", 77.04, 28.42, 37.8, 0.14, 220000, 30, 95),
            ("GGN-04", "Udyog Vihar Industrial", "Manufacturing Export Zone", 77.08, 28.51, 39.5, 0.08, 170000, 48, 140),
            ("GGN-05", "Manesar IMT Industrial Basin", "Heavy Auto Mega-Cluster", 76.92, 28.36, 41.2, 0.06, 180000, 54, 175),
            
            # Noida & Greater Noida (UP NCR)
            ("NDA-01", "Noida Sector 18 & Film City", "Commercial Retail CBD", 77.32, 28.57, 38.2, 0.14, 180000, 26, 115),
            ("NDA-02", "Noida Sector 62 IT Hub", "Tech Institutional Core", 77.36, 28.62, 37.5, 0.16, 210000, 28, 120),
            ("NDA-03", "Noida Expressway (Sec 128-137)", "High-Rise Living Strip", 77.38, 28.51, 36.8, 0.20, 240000, 22, 105),
            ("NDA-04", "Greater Noida (Pari Chowk/Alpha)", "Planned Educational Sub-City", 77.50, 28.47, 36.2, 0.26, 220000, 28, 90),
            ("NDA-05", "Greater Noida West (Noida Ext)", "Mega Residential Cluster", 77.43, 28.60, 37.9, 0.12, 280000, 36, 95),
            
            # Ghaziabad (UP NCR)
            ("GZB-01", "Indirapuram & Shipra Sun City", "High-Density Residential", 77.37, 28.64, 38.0, 0.14, 250000, 34, 88),
            ("GZB-02", "Vaishali & Kaushambi Metro", "Border Transit Hub", 77.33, 28.64, 38.4, 0.11, 220000, 40, 85),
            ("GZB-03", "Sahibabad Industrial Area", "Heavy Industrial Basin", 77.35, 28.67, 40.5, 0.05, 210000, 58, 135),
            
            # Faridabad (Haryana NCR)
            ("FBD-01", "Old Faridabad & Badkhal", "Central Commercial Hub", 77.31, 28.41, 38.6, 0.12, 240000, 45, 92),
            ("FBD-02", "Neharpar Greater Faridabad", "Expansive Modern Corridor", 77.35, 28.38, 37.2, 0.18, 210000, 32, 85),
            ("FBD-03", "Ballabgarh Industrial Core", "Heavy Manufacturing Cluster", 77.33, 28.33, 40.8, 0.06, 230000, 56, 140),
        ]
    },
    "bengaluru": {
        "name": "Bengaluru",
        "state": "Karnataka",
        "center": [77.5946, 12.9716],
        "bbox": [77.40, 12.75, 77.85, 13.25],
        "baseline_temp": 31.0,
        "wards": [
            ("BLR-01", "MG Road & Central Core", "CBD", 77.61, 12.97, 34.2, 0.18, 90000, 22, 85),
            ("BLR-02", "Koramangala 1-8 Blocks", "Startup Corridor", 77.62, 12.93, 35.4, 0.20, 140000, 25, 95),
            ("BLR-03", "Indiranagar & Domlur", "Green Commercial", 77.64, 12.97, 33.8, 0.28, 120000, 20, 75),
            ("BLR-04", "Whitefield & ITPL", "Tech Mega-Corridor", 77.75, 12.98, 36.8, 0.12, 220000, 32, 140),
            ("BLR-05", "Electronic City Phase 1 & 2", "Southern Tech Hub", 77.67, 12.84, 36.5, 0.14, 160000, 30, 125),
            ("BLR-06", "Bellandur & Outer Ring Road", "Tech Strip", 77.68, 12.93, 37.2, 0.10, 210000, 34, 130),
            ("BLR-07", "HSR Layout & BTM", "Planned Residential", 77.63, 12.91, 35.5, 0.18, 230000, 34, 82),
            ("BLR-08", "Jayanagar & JP Nagar", "Garden Suburb", 77.58, 12.91, 33.6, 0.32, 220000, 26, 70),
            ("BLR-09", "Peenya Industrial Area", "Heavy Industrial Basin", 77.52, 13.03, 38.6, 0.06, 170000, 54, 160),
            ("BLR-10", "Malleshwaram & Rajajinagar", "Heritage West", 77.56, 12.99, 34.5, 0.24, 170000, 30, 70),
            ("BLR-11", "Hebbal & Manyata Tech Park", "North Tech Nexus", 77.60, 13.04, 36.4, 0.16, 200000, 32, 120),
            ("BLR-12", "Yelahanka New Town", "Northern Suburb", 77.59, 13.10, 34.2, 0.26, 180000, 30, 68),
            ("BLR-13", "Devanahalli Airport City (BIAL)", "Aviation & Aerotropolis", 77.70, 13.20, 36.0, 0.22, 140000, 28, 110),
            ("BLR-14", "Sarjapur Road Corridor", "Emerging Tech Basin", 77.69, 12.89, 35.8, 0.20, 170000, 28, 85),
            ("BLR-15", "Kengeri & Mysore Road Hub", "Southwest Industrial", 77.48, 12.91, 35.6, 0.22, 160000, 44, 74),
            ("BLR-16", "Jigani & Anekal Industrial", "Southern Industrial Belt", 77.63, 12.78, 38.2, 0.10, 150000, 50, 120),
            ("BLR-17", "Hoskote Industrial Corridor", "Automotive East Cluster", 77.80, 13.07, 37.8, 0.14, 130000, 46, 105),
            ("BLR-18", "Nelamangala Highway Nexus", "Northwest Logistics", 77.42, 13.10, 36.6, 0.18, 150000, 42, 85),
        ]
    },
    "hyderabad": {
        "name": "Hyderabad",
        "state": "Telangana",
        "center": [78.4867, 17.3850],
        "bbox": [78.20, 17.18, 78.70, 17.65],
        "baseline_temp": 33.5,
        "wards": [
            ("HYD-01", "HITEC City & Madhapur", "IT Cyber Gateway", 78.38, 17.44, 37.6, 0.12, 180000, 24, 140),
            ("HYD-02", "Gachibowli Financial District", "Financial Tech Core", 78.35, 17.42, 37.2, 0.15, 140000, 20, 130),
            ("HYD-03", "Banjara & Jubilee Hills", "Affluent Green Ridge", 78.43, 17.42, 34.4, 0.34, 130000, 20, 75),
            ("HYD-04", "Charminar & Old City Core", "Dense Historic Center", 78.47, 17.36, 38.6, 0.07, 260000, 62, 78),
            ("HYD-05", "Secunderabad Station Hub", "Transit Nexus", 78.50, 17.44, 37.0, 0.14, 180000, 42, 82),
            ("HYD-06", "Kukatpally & Miyapur", "Mega Residential Hub", 78.39, 17.49, 37.2, 0.14, 290000, 38, 92),
            ("HYD-07", "Shamshabad Airport City (RGIA)", "Aviation & Logistics", 78.43, 17.24, 36.4, 0.24, 120000, 32, 115),
            ("HYD-08", "Patancheru Industrial Area", "Heavy Chemical Cluster", 78.26, 17.53, 40.2, 0.05, 160000, 58, 155),
            ("HYD-09", "Medchal Industrial Corridor", "Northern Manufacturing", 78.48, 17.63, 38.4, 0.12, 150000, 48, 110),
            ("HYD-10", "Dilsukhnagar & LB Nagar", "Eastern Transit Gateway", 78.53, 17.36, 37.8, 0.11, 250000, 46, 85),
            ("HYD-11", "Uppal & Ghatkesar Corridor", "East Industrial Strip", 78.60, 17.42, 37.9, 0.12, 190000, 42, 95),
            ("HYD-12", "Tellapur & Kollur Expansion", "Outer Growth Ring", 78.28, 17.47, 36.2, 0.22, 140000, 25, 80),
        ]
    },
    "ahmedabad": {
        "name": "Ahmedabad",
        "state": "Gujarat",
        "center": [72.5714, 23.0500],
        "bbox": [72.40, 22.88, 72.75, 23.28],
        "baseline_temp": 35.0,
        "wards": [
            ("AMD-01", "Navrangpura & CG Road", "Commercial Hub", 72.56, 23.03, 38.6, 0.14, 140000, 28, 95),
            ("AMD-02", "Ashram Road & Sabarmati", "Riverfront Promenade", 72.57, 23.03, 36.8, 0.22, 110000, 26, 80),
            ("AMD-03", "Khadia & Kalupur Core", "Historic Walled City", 72.59, 23.02, 40.5, 0.05, 240000, 60, 88),
            ("AMD-04", "SG Highway (Bodakdev/Thaltej)", "Prime Commercial Strip", 72.50, 23.05, 37.6, 0.16, 210000, 24, 115),
            ("AMD-05", "Bopal & South Bopal", "High-Density Western Hub", 72.47, 23.02, 37.4, 0.16, 190000, 30, 80),
            ("AMD-06", "Vatva GIDC Chemical Industrial", "Chemical Cluster", 72.63, 22.95, 41.6, 0.04, 180000, 58, 165),
            ("AMD-07", "Naroda GIDC Industrial", "Heavy Manufacturing", 72.65, 23.08, 41.2, 0.05, 200000, 50, 150),
            ("AMD-08", "Gandhinagar Capital (Sect 1-30)", "State Capital Core", 72.64, 23.22, 35.2, 0.35, 170000, 20, 85),
            ("AMD-09", "GIFT City Financial Hub", "International Financial SEZ", 72.68, 23.16, 36.5, 0.22, 90000, 18, 130),
            ("AMD-10", "Sanand Automobile Industrial", "Automobile Mega Cluster", 72.38, 22.98, 40.5, 0.08, 140000, 52, 160),
            ("AMD-11", "Changodar & Moraiya Industrial", "Pharma & Logistics", 72.44, 22.92, 39.8, 0.07, 130000, 50, 135),
            ("AMD-12", "Motera & Chandkheda", "Sports & Northern Corridor", 72.58, 23.10, 36.8, 0.20, 210000, 32, 90),
        ]
    },
    "chennai": {
        "name": "Chennai",
        "state": "Tamil Nadu",
        "center": [80.25, 13.05],
        "bbox": [80.02, 12.75, 80.35, 13.28],
        "baseline_temp": 33.0,
        "wards": [
            ("CHN-01", "T. Nagar & Central Core", "Commercial Core", 80.23, 13.04, 37.8, 0.12, 190000, 35, 95),
            ("CHN-02", "Mylapore & Adyar Coast", "Coastal Green Enclave", 80.25, 13.01, 34.0, 0.32, 180000, 24, 68),
            ("CHN-03", "OMR Cyber Corridor (Taramani)", "Tech IT Expressway", 80.24, 12.97, 37.4, 0.13, 180000, 26, 135),
            ("CHN-04", "Siruseri SIPCOT IT Park", "Far South Tech Mega Park", 80.22, 12.82, 36.8, 0.18, 150000, 25, 120),
            ("CHN-05", "Guindy Industrial Estate", "Central Manufacturing", 80.21, 13.01, 38.8, 0.09, 140000, 42, 120),
            ("CHN-06", "Tambaram & Chromepet", "Southern Transit City", 80.14, 12.92, 36.2, 0.20, 230000, 40, 78),
            ("CHN-07", "Ambattur Industrial Estate", "Major Manufacturing Hub", 80.15, 13.11, 39.5, 0.06, 210000, 52, 145),
            ("CHN-08", "Sriperumbudur Auto SEZ", "Global Electronics Auto", 79.95, 12.97, 40.2, 0.08, 160000, 50, 160),
            ("CHN-09", "Ennore Port & Manali Petrochem", "Petrochemical Refinery", 80.31, 13.18, 40.8, 0.04, 150000, 62, 160),
            ("CHN-10", "Avadi & Pattabiram", "Heavy Vehicles Military Hub", 80.10, 13.12, 37.6, 0.16, 220000, 44, 85),
        ]
    },
    "kolkata": {
        "name": "Kolkata",
        "state": "West Bengal",
        "center": [88.36, 22.57],
        "bbox": [88.20, 22.38, 88.58, 22.78],
        "baseline_temp": 33.2,
        "wards": [
            ("KOL-01", "BBD Bagh & Park Street", "Central CBD", 88.35, 22.56, 37.5, 0.14, 160000, 28, 90),
            ("KOL-02", "Salt Lake Sector 5 & Town", "IT Electronics Hub", 88.43, 22.58, 38.5, 0.12, 170000, 25, 130),
            ("KOL-03", "New Town Action Area 1-3", "Modern Satellite City", 88.48, 22.60, 36.2, 0.22, 210000, 26, 95),
            ("KOL-04", "Howrah Station & Shibpur", "Historic River Transit Core", 88.33, 22.58, 39.1, 0.05, 270000, 62, 88),
            ("KOL-05", "Bally & Kamarhati Industrial", "North Riverine Factory Belt", 88.36, 22.66, 39.4, 0.06, 240000, 58, 95),
            ("KOL-06", "Barrackpore & Titagarh", "Far North Industrial Fringe", 88.37, 22.76, 37.6, 0.18, 220000, 52, 80),
            ("KOL-07", "Topsia & Tangra Tannery", "Leather Industrial Basin", 88.39, 22.54, 39.8, 0.06, 210000, 58, 105),
            ("KOL-08", "Garia, Jadavpur & EM Bypass", "Southern Gateway", 88.37, 22.48, 35.8, 0.22, 230000, 34, 75),
            ("KOL-09", "Maheshtala & Taratala MIDC", "Southwest Industrial Strip", 88.25, 22.50, 38.6, 0.12, 250000, 52, 96),
            ("KOL-10", "Barasat & Airport Highway", "Northeast Growth Hub", 88.48, 22.72, 36.8, 0.20, 200000, 38, 80),
        ]
    },
    "jaipur": {
        "name": "Jaipur",
        "state": "Rajasthan",
        "center": [75.78, 26.91],
        "bbox": [75.60, 26.70, 75.98, 27.08],
        "baseline_temp": 35.5,
        "wards": [
            ("JAI-01", "Walled City (Pink City)", "Historic Masonry Core", 75.82, 26.92, 40.2, 0.05, 260000, 56, 85),
            ("JAI-02", "C-Scheme & Civil Lines", "Administrative Green", 75.80, 26.90, 36.2, 0.28, 110000, 20, 70),
            ("JAI-03", "Mansarovar Mega Suburb", "Planned Residential", 75.76, 26.86, 37.5, 0.16, 240000, 34, 85),
            ("JAI-04", "Sitapura Industrial Area", "Export Industrial Hub", 75.83, 26.78, 41.5, 0.04, 130000, 48, 140),
            ("JAI-05", "VKI Industrial Area North", "Heavy Metal Industrial", 75.78, 26.99, 41.8, 0.03, 140000, 54, 155),
            ("JAI-06", "Bagru Industrial & Textile", "Western Industrial Corridor", 75.55, 26.81, 41.0, 0.06, 120000, 52, 130),
            ("JAI-07", "Amer & Aravalli Foothills", "Heritage Hillside", 75.85, 26.99, 34.0, 0.36, 95000, 30, 48),
            ("JAI-08", "Jagatpura & Malviya Nagar", "East Tech Mixed", 75.84, 26.84, 37.8, 0.16, 210000, 30, 85),
        ]
    },
    "lucknow": {
        "name": "Lucknow",
        "state": "Uttar Pradesh",
        "center": [80.94, 26.84],
        "bbox": [80.75, 26.68, 81.15, 27.02],
        "baseline_temp": 34.5,
        "wards": [
            ("LKO-01", "Hazratganj & Vidhan Sabha", "State Administrative Core", 80.94, 26.85, 37.8, 0.18, 120000, 24, 90),
            ("LKO-02", "Chowk & Old City (Nakhhas)", "Dense Heritage Historic", 80.90, 26.87, 40.2, 0.05, 270000, 62, 82),
            ("LKO-03", "Gomti Nagar (Vipul/Vivek)", "Planned Riverfront City", 80.99, 26.85, 36.4, 0.24, 220000, 26, 95),
            ("LKO-04", "Gomti Nagar Extension Hub", "East High-Rise Growth", 81.03, 26.82, 37.5, 0.16, 170000, 28, 85),
            ("LKO-05", "Alambagh & Charbagh Stn", "Major Railway Transit", 80.91, 26.82, 38.9, 0.08, 240000, 54, 92),
            ("LKO-06", "Indira Nagar & Munshi Pulia", "Vast Residential Core", 80.98, 26.88, 36.5, 0.22, 250000, 32, 78),
            ("LKO-07", "Transport Nagar & Sarojini", "South Industrial Logistics", 80.87, 26.78, 39.8, 0.07, 180000, 52, 115),
            ("LKO-08", "Mohanlalganj & Outer South", "Southern Growth Corridor", 80.98, 26.70, 37.0, 0.24, 150000, 44, 75),
            ("LKO-09", "Chinhat & Faizabad Road", "Industrial Tech Nexus", 81.05, 26.89, 38.4, 0.14, 190000, 42, 90),
        ]
    }
}


def make_voronoi_tessellation(wards, bbox):
    """Generate bounded Voronoi polygons for the ward centroids."""
    coords = np.array([[w[3], w[4]] for w in wards])
    min_x, min_y, max_x, max_y = bbox

    pad_x = (max_x - min_x) * 0.35
    pad_y = (max_y - min_y) * 0.35
    dummy_points = [
        [min_x - pad_x, min_y - pad_y],
        [min_x - pad_x, max_y + pad_y],
        [max_x + pad_x, min_y - pad_y],
        [max_x + pad_x, max_y + pad_y],
        [min_x - pad_x, (min_y + max_y)/2],
        [max_x + pad_x, (min_y + max_y)/2],
        [(min_x + max_x)/2, min_y - pad_y],
        [(min_x + max_x)/2, max_y + pad_y],
    ]
    all_points = np.vstack([coords, dummy_points])
    vor = Voronoi(all_points)

    bounding_box = box(min_x, min_y, max_x, max_y)
    features = []

    for idx, w in enumerate(wards):
        w_id, w_name, w_zone, lon, lat, lst, ndvi, pop, vul_pct, grid_mw = w
        region_idx = vor.point_region[idx]
        region = vor.regions[region_idx]

        if not region or -1 in region:
            poly = Point(lon, lat).buffer(0.02)
        else:
            vertices = [vor.vertices[i] for i in region]
            poly = Polygon(vertices)
            if not poly.is_valid:
                poly = poly.buffer(0)

        clipped = poly.intersection(bounding_box)
        if clipped.is_empty or not clipped.is_valid:
            clipped = Point(lon, lat).buffer(0.02).intersection(bounding_box)

        clipped = clipped.simplify(0.0004, preserve_topology=True)
        geom_mapping = json.loads(gpd.GeoSeries([clipped]).to_json())["features"][0]["geometry"]
        anomaly = round(lst - 33.0, 1)
        severity = "critical" if anomaly >= 4.0 else "high" if anomaly >= 2.5 else "moderate"

        features.append({
            "type": "Feature",
            "geometry": geom_mapping,
            "properties": {
                "zone_id": w_id,
                "name": w_name,
                "zone": w_zone,
                "lst": lst,
                "ndvi": ndvi,
                "ndbi": round(0.42 - ndvi * 0.55, 2),
                "population": pop,
                "vulnerable_pop_pct": vul_pct,
                "anomaly": anomaly,
                "risk_severity": severity,
                "grid_mw": grid_mw
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }


def setup_all_cities():
    print("=" * 65)
    print("Generating Comprehensive Metropolitan Datasets (MMR, PMRDA, NCR...)")
    print("=" * 65)

    for city_key, city_info in METROPOLITAN_CITIES.items():
        print(f"\nProcessing {city_info['name']} Metropolitan Area ({city_info['state']})...")
        data_dir = processed_dir(city_key)
        data_dir.mkdir(parents=True, exist_ok=True)
        model_dir = data_dir / "model"
        model_dir.mkdir(parents=True, exist_ok=True)

        geojson_path = data_dir / f"{city_key}_zones.geojson"
        model_path = model_dir / f"{city_key}_rf_model.joblib"

        geojson_data = make_voronoi_tessellation(city_info["wards"], city_info["bbox"])
        with open(geojson_path, "w", encoding="utf-8") as f:
            json.dump(geojson_data, f, indent=2)
        print(f"  ✓ Saved {len(city_info['wards'])} Metropolitan Wards -> {geojson_path.name}")

        model = UrbanHeatModel(model_type="hgbr", feature_mode="relative_spatial", physics_informed=True)
        metrics = model.train(geojson_path, output_path=model_path)
        print(f"  ✓ Trained ML Model -> RMSE: {metrics['rmse']:.3f}°C, R²: {metrics['r2']:.4f}")

    print("\n✓ Successfully updated all metropolitan areas across India!")


if __name__ == "__main__":
    setup_all_cities()
