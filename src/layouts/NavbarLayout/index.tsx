// 空白布局 整个页面都需要自己写

import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Col, Menu, MenuProps, Row } from "antd";
import { AppstoreOutlined, MailOutlined, SettingOutlined, RobotOutlined, FormOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

import styles from "./index.less";

const items: MenuProps["items"] = [
    {
        label: "聊天",
        key: "/chat",
        icon: <RobotOutlined />,
    },
    // {
    //     label: "笔记",
    //     key: "/note",
    //     icon: <FormOutlined />,
    // },
];
const NavbarLayout = () => {
    const [current, setCurrent] = useState("chat");
    const navigate = useNavigate();
    const location = useLocation();

    const [windowHeight, setWindowHeight] = useState(window.innerHeight);

    useEffect(() => {
        const resize = () => {
            setWindowHeight(window.innerHeight);
        };
        window.addEventListener("resize", resize);

        return () => window.removeEventListener("resize", resize);
    }, []);

    return (
        <div className={styles.layout} style={{ height: windowHeight }}>
            <div className={styles.header}>
                <Row>
                    {/* <Col span={8}></Col> */}
                    <Col span={24}>
                        <Menu
                            className={styles.menu}
                            onClick={(e) => {
                                if (location.pathname != e.key) {
                                    navigate(e.key);
                                }
                            }}
                            selectedKeys={[location.pathname]}
                            mode="horizontal"
                            items={items}
                        />
                    </Col>
                </Row>
            </div>
            <div className={styles.content}>
                <Outlet />
            </div>
        </div>
    );
};
export default NavbarLayout;
