import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import axiosInstance from "@/service/axios";
import { User } from "@/types/user";
import { BanIcon, CheckCircle, CircleOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import UAParser from "ua-parser-js";

const LoginHistory = ({ user }: { user: User }) => {
  const [loginHistory, setLoginHistory] = useState<any[]>([]);

  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      const history = await axiosInstance.get("/user/admin-api/login-history", {
        params: {
          target: user._id,
        },
      });
      setLoginHistory(history.data.data.records);
    })();
  }, [user]);

  return (
    <>
      {!loginHistory.length && (
        <div className="flex items-center">
          <CircleOff className="h-4 w-4 mr-2" />
          {t("message.nothing-to-show")}
        </div>
      )}
      {loginHistory.map((entry: any) => {
        let parserResults;
        if (entry.userAgent) {
          const parser = new UAParser(entry.userAgent);
          parserResults = parser.getResult();
        }
        return (
          <Alert key={entry.createdAt}>
            {entry.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <BanIcon className="h-4 w-4" />
            )}

            <AlertTitle>
              {entry.success
                ? t("message.successful-login")
                : t("message.failed-login-attempt")}
            </AlertTitle>
            {parserResults && (
              <AlertDescription>
                {parserResults.browser.name} {parserResults.browser.version} on{" "}
                {parserResults.os.name} {parserResults.os.version}{" "}
                {parserResults.device.vendor} {parserResults.device.model}
              </AlertDescription>
            )}
            <AlertDescription className="text-xs opacity-50">
              {new Date(entry.createdAt).toLocaleString()}
            </AlertDescription>
          </Alert>
        );
      })}
    </>
  );
};

export default LoginHistory;
