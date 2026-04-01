export interface CounterResponse {
  entityType: string
  entityId: string
  counts: {
    like?: number
    fav?: number
  }
}
