# scripts/generate_password_hash.py
from argon2 import PasswordHasher
import getpass

def main():
    ph = PasswordHasher()
    password = getpass.getpass('Type the password: ')
    hashed = ph.hash(password)
    print(hashed)

if __name__ == '__main__':
    main()