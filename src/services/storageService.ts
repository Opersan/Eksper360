import { supabase, isSupabaseConfigured } from './supabase'

const BUCKET_NAME = 'expertise-photos'

export async function uploadPhoto(
  userId: string,
  expertiseId: string,
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    // Return a fake URL for demo
    const fakeUrl = URL.createObjectURL(file)
    return { url: fakeUrl, error: null }
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${expertiseId}/${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, { upsert: false })

  if (uploadError) return { url: null, error: uploadError }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName)

  return { url: data.publicUrl, error: null }
}

export async function deletePhoto(path: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: null }
  }

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path])
  return { error }
}
