import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase: Client = create_client(
    os.getenv("https://kscqzqryqkjjhtjhwxia.supabase.co"),
    os.getenv("sb_publishable_0c4EgQus5EdJbwR1lWyH3w_rFl20v6m")
)

def get_supabase():
    return supabase