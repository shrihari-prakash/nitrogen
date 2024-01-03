import { useState } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-json";
import "prismjs/themes/prism-solarizedlight.min.css";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import axiosInstance from "@/service/axios";
import { toast } from "sonner";

const CustomDataEditor = ({ user }: { user: User }) => {
  const [customData, setCustomData] = useState(
    user.customData ? JSON.stringify(user.customData, null, 4) : `{}`
  );
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(formValues: any) {
    setSubmitting(true);
    console.log(formValues);
    let promise;
    let serialized;
    try {
      serialized = JSON.parse(customData);
    } catch (e) {
      toast.error("Invalid JSON");
      setSubmitting(false);
      return;
    }
    try {
      promise = axiosInstance.put("/user/admin-api/custom-data", {
        target: user._id,
        customData: serialized,
      });
      toast.promise(promise, {
        loading: "Processing changes...",
        success: "Update complete",
        error: (data: any) => {
          console.log(data);
          const errors = data?.response?.data?.additionalInfo?.errors;
          if (errors) {
            return "Invalid JSON";
          }
          return "Update failed!";
        },
      });
      await promise;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Editor
        value={customData}
        onValueChange={(code) => setCustomData(code)}
        highlight={(code) => highlight(code, languages.json)}
        padding={10}
        className="text-sm font-mono"
      />
      <div className="flex sm:flex-row sm:justify-end sm:space-x-2 flex-col mt-4">
        <Button
          type="submit"
          className="mb-2 md:mb-0"
          variant="outline"
          onClick={onSubmit}
        >
          <Save className="h-4 w-4 mr-2" />
          {submitting ? "Saving..." : "Save Custom Data"}
        </Button>
      </div>
    </>
  );
};

export default CustomDataEditor;
