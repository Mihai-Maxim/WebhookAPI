# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /

# Copy package.json and package-lock.json to the container
COPY package*.json ./

COPY *.env ./

# Install project dependencies
RUN npm install

# Copy Prisma files to the container
COPY prisma ./prisma


# RUN npx prisma migrate deploy

# Generate Prisma Client
RUN npx prisma generate



# Copy the rest of the project files to the container
COPY . .

# Expose the port that your application listens on (if applicable)
EXPOSE 3000

# Specify the command to run your application
CMD ["npm", "start"]
