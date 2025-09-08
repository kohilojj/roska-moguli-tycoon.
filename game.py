import time

class RoskaMoguli:
    def __init__(self):
        self.roskat = 0
        self.rahat = 0
        self.hinta = 5
        self.taso = 1

    def kerää_roskia(self):
        print("🗑️  Keräät roskia...")
        time.sleep(1)
        self.roskat += 1
        print(f"Sinulla on nyt {self.roskat} roskia.")

    def myy_roskat(self):
        if self.roskat > 0:
            tienestit = self.roskat * self.hinta
            self.rahat += tienestit
            print(f"💰 Myit {self.roskat} roskia ja sait {tienestit} €!")
            self.roskat = 0
        else:
            print("Ei ole mitään myytävää...")

    def päivitä_bisnes(self):
        hinta = 50 * self.taso
        if self.rahat >= hinta:
            self.rahat -= hinta
            self.hinta += 5
            self.taso += 1
            print(f"📈 Bisnes kasvoi! Nyt roskasta saa {self.hinta} € (taso {self.taso}).")
        else:
            print(f"Tarvitset {hinta} € kehitykseen. Sinulla on {self.rahat} €.")

def menu():
    moguli = RoskaMoguli()
    while True:
        print("\n=== ROSKA MOGULI TYCOON ===")
        print(f"Roskia: {moguli.roskat} | Rahaa: {moguli.rahat} € | Taso: {moguli.taso}")
        print("1. Kerää roskia 🗑️")
        print("2. Myy roskat 💰")
        print("3. Päivitä bisnes 📈")
        print("4. Lopeta ❌")
        choice = input("Valitse: ")

        if choice == "1":
            moguli.kerää_roskia()
        elif choice == "2":
            moguli.myy_roskat()
        elif choice == "3":
            moguli.päivitä_bisnes()
        elif choice == "4":
            print("Kiitos pelaamisesta! 👋")
            break
        else:
            print("Virheellinen valinta.")

if __name__ == "__main__":
    menu()
