import { useState } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-json";
import "prismjs/themes/prism-solarizedlight.min.css";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { FaFloppyDisk, FaCheck, FaWandMagicSparkles } from "react-icons/fa6";
import { useUpdateCustomData } from "@/hooks/api/use-user-mutations";

const CustomDataEditor = ({ user }: { user: User }) => {
  const [customData, setCustomData] = useState(
    user.customData ? JSON.stringify(user.customData, null, 4) : `{}`
  );
  const [isFormatting, setIsFormatting] = useState(false);
  const { mutateAsync: updateCustomData, isPending: submitting } = useUpdateCustomData();

  const { t } = useTranslation();

  const formatJson = () => {
    try {
      const parsed = JSON.parse(customData);
      setCustomData(JSON.stringify(parsed, null, 4));
      setIsFormatting(true);
      setTimeout(() => setIsFormatting(false), 1000);
    } catch (e) {
      toast.error(t("message.cannot-format-invalid-json"));
    }
  };

  async function onSubmit(formValues: any) {
    console.log(formValues);
    let promise;
    let serialized;
    try {
      serialized = JSON.parse(customData);
    } catch (e) {
      toast.error("Invalid JSON");
      return;
    }
    try {
      promise = updateCustomData({
        target: user._id,
        customData: serialized,
      });
      toast.promise(promise, {
        loading: "Processing changes...",
        success: "Update complete",
        error: (error: any) => {
          console.log(error);
          const data = error.response?.data;
          const errors = data?.additionalInfo?.errors;
          if (errors) {
            return "Invalid JSON";
          }
          return "Update failed!";
        },
      });
      await promise;
    } catch (e) {
      // Error handled by toast
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-sm text-muted-foreground">
          {t("message.custom-data-description")}
        </p>
      </div>

      <div className="relative group rounded-md border bg-muted/20">
        <Editor
          value={customData}
          onValueChange={(code) => setCustomData(code)}
          highlight={(code) => highlight(code, languages.json)}
          padding={16}
          className="text-sm font-mono min-h-[200px]"
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button size="sm" variant="outline" onClick={formatJson} className="h-7 text-xs">
            {isFormatting ? <FaCheck className="w-3 h-3 mr-1" /> : <FaWandMagicSparkles className="w-3 h-3 mr-1" />}
            {t("button.format")}
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          onClick={onSubmit}
          disabled={submitting}
        >
          <FaFloppyDisk className="h-4 w-4 mr-2" />
          {submitting ? t("button.saving") : t("button.save-custom-data")}
        </Button>
      </div>
    </div>
  );
};

export default CustomDataEditor;
