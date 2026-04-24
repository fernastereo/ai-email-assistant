import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

export const TermsOfService = ({ isTermsOpen, setIsTermsOpen }: { isTermsOpen: boolean, setIsTermsOpen: (isOpen: boolean) => void }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('waitlist.terms.dialog_title')}</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          </DialogClose>
        </DialogHeader>
        <div className="py-4 space-y-1">
          {t('waitlist.terms.content', { returnObjects: true }).map((content: string, index: number) => (
            <div key={index} className={index % 2 === 0 ? "font-semibold text-xs" : "text-muted-foreground text-xs"}>
              {content}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
