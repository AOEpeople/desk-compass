FROM node:lts AS build
ENV CI=true

WORKDIR /app

COPY . ./

RUN yarn install --frozen-lockfile --ingnore-scripts

RUN yarn workspace frontend build

RUN yarn workspace api build

USER node

FROM node:lts as prod
WORKDIR /app

COPY --chown=node:node --from=build /app/workspaces/api/dist ./

# This copies also dev dependencies and from both frontend and api
COPY --chown=node:node --from=build /app/node_modules ./node_modules/

COPY --chown=node:node --from=build /app/workspaces/frontend/dist ./static/

CMD ["node", "main"]
