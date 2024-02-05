import { toast } from 'sonner'

export async function fetchWithToast(url: string, options?: RequestInit) {
  const promise = fetch(url, options)
  toast.promise(promise, {
    loading: 'Processing...',
    success: 'Success!',
    error: 'Failed to process the request.',
  })
  return promise
}
