# Define a imagem base para o container - Node.js versão 18 em distribuição Alpine (leve)
FROM node:18-alpine

# Define o diretório de trabalho dentro do container onde o app ficará
WORKDIR /app

# Copia os arquivos package.json e package-lock.json para o diretório /app
COPY package*.json ./

# Executa o comando npm install para instalar todas as dependências do projeto
RUN npm install

RUN npm ci --only=production


# Copia todo o restante do código fonte da aplicação para o diretório /app
COPY . .

COPY server.js ./

# Informa que o container irá escutar na porta 3000 (documentação)
EXPOSE 3000

# Comando que será executado quando o container iniciar - inicia a aplicação Node.js
CMD ["npm", "start"]
