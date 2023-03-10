import { Spin } from "antd";
import { Suspense, useEffect, useState } from "react";
import { useRoutes } from "react-router-dom";
import { useRecoilState } from "recoil";

// import NoAuth from "@/pages/403";
// import LoadingPage from "@/pages/LoadingPage";
// import { userInfoAtom } from "@/recoil/user";
// import { userInfo } from "@/services/manager";
// import { useRequest } from "@/utils/request";

import styles from "./routerApp.less";
import routerConfig from "./routerConfig";
import { useLocalStorageState, useRequest } from "ahooks";
import { loginApi } from "@/services/chat";
import NoAuth from "@/pages/403";

const fallbackStyle = { paddingTop: 100, textAlign: "center" };

export default function RouterApp() {
    const element = useRoutes(routerConfig);

    const [isLogin, setIsLogin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userId, serUserId] = useLocalStorageState<number>("local-storage-user-id", {
        defaultValue: 0,
    });

    useEffect(() => {
        (async () => {
            setLoading(true);
            const res = await loginApi(userId);
            setIsLogin(true);
            serUserId(res.data);
            setLoading(false);
        })();
    }, []);

    if (loading) {
        return <Spin className={styles.spin} size="large"></Spin>;
    }

    if (!isLogin) {
        return <NoAuth></NoAuth>;
    }
    return <Suspense fallback={<Spin className={styles.spin} size="large"></Spin>}>{element}</Suspense>;
}
