import os

class Config:
    # Configurações de e-mail
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 465
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', 'seu-email@gmail.com')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', 'sua-senha-de-app')
    MAIL_USE_TLS = False
    MAIL_USE_SSL = True
    MAIL_DEFAULT_SENDER = 'seu-email@gmail.com'

    # Configurações de banco de dados
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_HOST = os.getenv('DB_HOST', 'localhost')  # Padrão para ambiente local
    DB_PORT = os.getenv('DB_PORT', 5432)  # Padrão para PostgreSQL
    DB_NAME = os.getenv('DB_NAME', '')  # Nome do banco no local

    # Configuração do banco para produção (para o Supabase)
    DB_USER_PROD = os.getenv('DB_USER_PROD', 'postgres.rtnmkzszwyguixdrtikl')
    DB_PASSWORD_PROD = os.getenv('DB_PASSWORD_PROD', 'senha_prod_supabase')
    DB_HOST_PROD = os.getenv('DB_HOST_PROD', 'aws-0-us-west-1.pooler.supabase.com')
    DB_PORT_PROD = os.getenv('DB_PORT_PROD', 6543)
    DB_NAME_PROD = os.getenv('DB_NAME_PROD', 'postgres')

    # Lógica para escolher o banco de dados baseado no ambiente
    if os.getenv('ENVIRONMENT') == 'production':
        DB_USER = DB_USER_PROD
        DB_PASSWORD = DB_PASSWORD_PROD
        DB_HOST = DB_HOST_PROD
        DB_PORT = DB_PORT_PROD
        DB_NAME = DB_NAME_PROD
