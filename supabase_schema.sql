-- =====================================================
-- OTO EKSPERTİZ SİSTEMİ - Supabase SQL Şeması
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın
-- =====================================================

-- 1. Profiles tablosu
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Expertises tablosu
CREATE TABLE IF NOT EXISTS expertises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate TEXT NOT NULL,
  customer_name TEXT,
  km TEXT,
  transmission_type TEXT,
  photos TEXT[] DEFAULT '{}',
  body_checks JSONB DEFAULT '[]',
  inspection_checks JSONB DEFAULT '[]',
  tire_info JSONB DEFAULT '{}',
  engine_note TEXT,
  mechanical_note TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'reported')),
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Updated_at otomatik güncellemesi
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER expertises_updated_at
  BEFORE UPDATE ON expertises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. Profil otomatik oluşturma
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- RLS POLİTİKALARI
-- =====================================================

-- RLS'yi etkinleştir
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expertises ENABLE ROW LEVEL SECURITY;

-- Profiles: Kullanıcı kendi profilini okuyabilir
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Expertises: Kullanıcı kendi kayıtlarını okuyabilir
CREATE POLICY "Users can view own expertises"
  ON expertises FOR SELECT
  USING (auth.uid() = created_by);

-- Expertises: Kullanıcı kendi kayıtlarını oluşturabilir
CREATE POLICY "Users can create expertises"
  ON expertises FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Expertises: Kullanıcı kendi kayıtlarını güncelleyebilir
CREATE POLICY "Users can update own expertises"
  ON expertises FOR UPDATE
  USING (auth.uid() = created_by);

-- Expertises: Kullanıcı kendi kayıtlarını silebilir
CREATE POLICY "Users can delete own expertises"
  ON expertises FOR DELETE
  USING (auth.uid() = created_by);

-- =====================================================
-- STORAGE (Supabase Dashboard > Storage'da yapın)
-- =====================================================
-- 1. "expertise-photos" adında bir bucket oluşturun
-- 2. Public bucket yapın (veya aşağıdaki policy'i ekleyin)

-- Storage Policy (SQL Editor'de çalıştırın):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('expertise-photos', 'expertise-photos', true);

-- CREATE POLICY "Users can upload photos"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'expertise-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Public photos are viewable"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'expertise-photos');

-- CREATE POLICY "Users can delete own photos"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'expertise-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
