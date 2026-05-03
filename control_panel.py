import tkinter as tk
from tkinter import messagebox
import subprocess
import os

def start_system():
    try:
        # Menjalankan server.js di jendela command prompt baru
        subprocess.Popen(['start', 'cmd', '/k', 'node server.js'], shell=True)
        messagebox.showinfo("System Started", "Sistem WhatsApp Bot sedang dinyalakan di terminal baru!\n\nTunggu hingga tulisan 'WhatsApp Bot siap!' muncul.")
    except Exception as e:
        messagebox.showerror("Error", f"Gagal menyalakan sistem: {e}")

def emergency_stop():
    try:
        # Konfirmasi sebelum mematikan
        confirm = messagebox.askyesno("PERINGATAN!", "Apakah Anda yakin ingin MEMATIKAN PAKSA semua sistem bot?")
        if confirm:
            # Membunuh paksa semua proses node.exe di Windows
            result = os.system('taskkill /F /IM node.exe /T')
            if result == 0:
                messagebox.showwarning("EMERGENCY", "Semua sistem bot telah DIMATIKAN secara paksa!")
            else:
                messagebox.showinfo("Info", "Sistem sepertinya memang sedang tidak berjalan (node.exe tidak ditemukan).")
    except Exception as e:
        messagebox.showerror("Error", f"Gagal mematikan sistem: {e}")

# Setup UI (Tampilan Layar)
root = tk.Tk()
root.title("WhatsApp AI - Control Panel")
root.geometry("350x250")
root.configure(bg="#1e272e") # Warna background gelap
root.resizable(False, False)

# Label Judul
title_label = tk.Label(root, text="🤖 Bot Control Panel", font=("Segoe UI", 16, "bold"), bg="#1e272e", fg="#d2dae2")
title_label.pack(pady=20)

# Tombol Nyala
btn_start = tk.Button(root, text="▶ START SYSTEM", font=("Segoe UI", 12, "bold"), bg="#0be881", fg="#1e272e", 
                      activebackground="#05c46b", activeforeground="white", width=20, height=2, bd=0, cursor="hand2", command=start_system)
btn_start.pack(pady=10)

# Tombol Mati (Emergency)
btn_stop = tk.Button(root, text="🛑 EMERGENCY STOP", font=("Segoe UI", 12, "bold"), bg="#ff3f34", fg="white", 
                     activebackground="#ff5e57", activeforeground="white", width=20, height=2, bd=0, cursor="hand2", command=emergency_stop)
btn_stop.pack(pady=10)

root.mainloop()
