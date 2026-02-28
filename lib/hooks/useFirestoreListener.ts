import { useEffect, useState } from 'react'
import {
  collection,
  query,
  onSnapshot,
  QueryConstraint,
  DocumentData,
  QuerySnapshot,
  FirestoreError,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export function useFirestoreListener<T extends DocumentData>(
  collectionName: string,
  constraints?: QueryConstraint[],
  enabled: boolean = true
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    try {
      const q = constraints && constraints.length > 0
        ? query(collection(db, collectionName), ...constraints)
        : collection(db, collectionName)

      const unsubscribe = onSnapshot(
        q as any,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const docs: T[] = []
          snapshot.forEach((doc) => {
            docs.push(doc.data() as T)
          })
          setData(docs)
          setLoading(false)
          setError(null)
        },
        (err: FirestoreError) => {
          setError(err.message)
          setLoading(false)
        }
      )

      return unsubscribe
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to listen to collection')
      setLoading(false)
    }
  }, [collectionName, enabled])

  return { data, loading, error }
}
