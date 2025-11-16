FROM public.ecr.aws/lambda/nodejs:20

COPY package*.json ./
RUN npm ci --production

COPY dist ./dist
COPY node_modules ./node_modules

CMD ["dist/lambda.handler"]
