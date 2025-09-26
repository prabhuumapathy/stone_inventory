import { asValue } from "awilix"

export default async ({ container }) => {
  container.register({
    manager: asValue(container.manager), // make manager resolvable
  })
}