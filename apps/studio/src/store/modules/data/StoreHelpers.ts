import { HasId } from "@/common/interfaces/IGeneric";
import _ from "lodash";
import rawLog from '@bksLogger'

const log = rawLog.scope('StoreHelpers')
export type ClientError = Error | string | Error[] | string[] | null

interface BasicContext {
  state: {
    loading: boolean
    error: ClientError
  }
  commit(str: string, item: any)
}

export async function safely<U>(context: BasicContext, f: () => Promise<U>, onError?: (error: ClientError) => void) {
  try {
    context.commit('loading', true)
    context.commit('error', null)
    await f()
  } catch (error) {
    context.commit('error', error)
    log.error('safely', error)
    onError?.(error)
  } finally {
    context.commit('loading', false)
  }
}


export function upsert<T extends HasId>(list: T[], item: T, func = (a: T, b: T) => a.id === b.id) {
  const found = _.find(list, (q: T) => func(q, item))
  if (found) {
    // we do this so that the object itself stays the same
    Object.assign(found, item)
  } else {
    list.push(item)
  }
}
