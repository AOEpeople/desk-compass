FROM node:lts AS build
ENV CI=true

WORKDIR /app

COPY . ./

RUN yarn install --frozen-lockfile --ingnore-scripts

RUN yarn workspace frontend build

RUN yarn workspace api build

USER node

FROM node:lts as api-prod-dependencies

WORKDIR /app

COPY . ./

RUN yarn workspace api install --frozen-lockfile --ingnore-scripts --production

FROM node:lts as prod
WORKDIR /app

COPY --chown=node:node --from=api-prod-dependencies /app/node_modules ./node_modules/
COPY --chown=node:node --from=build /app/workspaces/api/dist ./
COPY --chown=node:node --from=build /app/workspaces/frontend/dist ./static/

CMD ["node", "main"]
