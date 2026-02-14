import { getStore } from '@netlify/blobs'

export function store() {
  return getStore('infi-control-ui-v2')
}
