import { Button, Layout, List, Popconfirm, Typography } from "antd";
import styles from "./index.less";
import { PlusOutlined, MessageOutlined, LogoutOutlined, DeleteOutlined } from "@ant-design/icons";
import ChatSession from "./ChatSession";
import ChatBottom from "./ChatBottom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { ChatSessionsAtom, CurrentChatSessionAtom, CurrentChatSessionRecordAtom, Session } from "@/recoil/chat";
import { getChatRecordsApi, getChatSessionsApi } from "@/services/chat";
import { useEffect, useState } from "react";
import { useLocalStorageState, useRequest } from "ahooks";
import * as classNames from "classnames";
const { Header, Footer, Sider, Content } = Layout;
export default function Chat() {
    const [currentChatSession, setCurrentChatSession] = useRecoilState(CurrentChatSessionAtom);
    const setCurrentChatSessionRecord = useSetRecoilState(CurrentChatSessionRecordAtom);
    const [chatSessions, setChatSessions] = useRecoilState(ChatSessionsAtom);
    const [collapsed, setCollapsed] = useState(false);

    const [userId, serUserId] = useLocalStorageState<number>("local-storage-user-id", {
        defaultValue: 0,
    });

    useEffect(() => {
        getChatSessions();
    }, []);

    const { loading: getChatSessionsLoading, run: getChatSessions } = useRequest(getChatSessionsApi, {
        manual: true,
        onSuccess: (result, params) => {
            // console.info(result);
            if (result.status != 200) {
                return;
            }
            setChatSessions(result.data);
        },
    });

    const { loading, run: getChatRecords } = useRequest(getChatRecordsApi, {
        manual: true,
        onSuccess: (result, params) => {
            // console.info(result);
            if (result.status != 200) {
                return;
            }
            setCurrentChatSessionRecord(result.data);
        },
    });

    return (
        <>
            <Layout className={styles.layout}>
                <Sider
                    className={styles.sider}
                    collapsed={collapsed}
                    collapsible
                    collapsedWidth={0}
                    breakpoint="md"
                    onBreakpoint={(v) => {
                        // console.info(1111, v);
                        setCollapsed(v);
                    }}
                    onCollapse={(collapsed, type) => {
                        // console.info(collapsed, type);
                        setCollapsed(collapsed);
                    }}
                >
                    <div className={styles.siderChildren}>
                        <a
                            className={styles.newChatBtn}
                            onClick={() => {
                                setCurrentChatSession(null);
                                setCurrentChatSessionRecord([]);
                            }}
                        >
                            <PlusOutlined />
                            &nbsp; 新聊天
                        </a>
                        <div style={{ overflow: "auto", marginBottom: 40 }}>
                            {chatSessions.map((item) => {
                                const currentSession = currentChatSession === item.id ? styles.currentSession : undefined;
                                return (
                                    <div
                                        key={item.id}
                                        className={classNames(styles.chatTitle, currentSession)}
                                        onClick={() => {
                                            setCurrentChatSession(item.id);
                                            getChatRecords(item.id);
                                        }}
                                    >
                                        <MessageOutlined /> &nbsp;{item.title}
                                    </div>
                                );
                            })}
                        </div>
                        <div className={styles.options}>
                            <Popconfirm
                                title="不可恢复"
                                description="确认清空所有聊天记录吗?"
                                onConfirm={() => {
                                    serUserId(null);
                                    location.reload();
                                }}
                                onCancel={() => {}}
                                okText="确定"
                                cancelText="取消"
                            >
                                <div className={classNames(styles.chatTitle)}>
                                    <DeleteOutlined />
                                    &nbsp; 清空聊天记录
                                </div>
                            </Popconfirm>

                            {/* <div className={classNames(styles.chatTitle)} >
                                <LogoutOutlined />
                                &nbsp; 退出登录
                            </div> */}
                        </div>
                    </div>
                </Sider>
                <Content className={styles.content}>
                    <ChatSession></ChatSession>
                    <ChatBottom></ChatBottom>
                </Content>
            </Layout>
        </>
    );
}
