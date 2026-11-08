// src/app/(panel)/panel/hesap/page.tsx — hesap ayarları: profil, bildirim tercihi, şifre, hesabı silme
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { hasAdminServiceKey } from "@/lib/supabase/admin";
import { getMyProfile } from "@/lib/queries/member";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { Accent, PageHeader, SectionHeading } from "@/components/ui/page-header";
import { DeleteAccountDialog, EmailPreferenceForm, PasswordForm, ProfileForm } from "@/components/panel/account-forms";

export const metadata: Metadata = { title: "Hesap" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser("/panel/hesap");
  const profile = (await getMyProfile(user.id)) ?? user.profile;
  const canDelete = hasAdminServiceKey() && user.role !== "admin";

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <PageHeader title={<Accent>Hesap</Accent>} description="Profil bilgilerin, bildirim tercihlerin ve güvenlik ayarların." />

      <section aria-labelledby="profil" className="flex flex-col gap-3">
        <SectionHeading title={<span id="profil">Profil</span>} />
        <Card>
          <ProfileForm fullName={profile.full_name} phone={profile.phone ?? ""} email={user.email} />
        </Card>
      </section>

      <section aria-labelledby="bildirim" className="flex flex-col gap-3">
        <SectionHeading title={<span id="bildirim">Bildirimler</span>} />
        <Card>
          <EmailPreferenceForm enabled={profile.email_notifications} />
        </Card>
      </section>

      <section aria-labelledby="guvenlik" className="flex flex-col gap-3">
        <SectionHeading title={<span id="guvenlik">Şifre</span>} description="Google ile giriş yaptıysan da buradan bir şifre belirleyebilirsin." />
        <Card>
          <PasswordForm />
        </Card>
      </section>

      <section aria-labelledby="tehlike" className="flex flex-col gap-3">
        <SectionHeading title={<span id="tehlike">Hesabı sil</span>} />
        <Card className="flex flex-col gap-4 border-danger/30">
          <p className="text-sm leading-relaxed text-ink-soft">
            Hesabını sildiğinde tüm verilerin kalıcı olarak kaldırılır. Devam eden bir eğitimin ya da talebin varsa önce ekibimizle konuşmanı öneririz.
          </p>
          {canDelete ? (
            <div>
              <DeleteAccountDialog email={user.email} />
            </div>
          ) : (
            <Alert tone="info">
              {user.role === "admin"
                ? "Admin hesapları panelden silinemez."
                : "Hesap silme şu an panelden yapılamıyor. İletişim sayfasından ya da e-postayla bize yaz; hesabını en geç 2 iş günü içinde sileriz."}
            </Alert>
          )}
        </Card>
      </section>
    </div>
  );
}
