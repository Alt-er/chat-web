import { Button, Layout, List, message, Typography } from "antd";
import styles from "./index.less";
import { PlusOutlined, MessageOutlined, SendOutlined, LoadingOutlined } from "@ant-design/icons";
const { Header, Footer, Sider, Content } = Layout;
import { Input } from "antd";
import { useRef, useState } from "react";
import type { TextAreaRef } from "antd/es/input/TextArea";
import { completionApi, getChatSessionsApi } from "@/services/chat";
import { useRequest } from "ahooks";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { ChatSessionsAtom, CurrentChatSessionAtom, CurrentChatSessionRecordAtom, RecordCompletingAtom } from "@/recoil/chat";
const { TextArea } = Input;

export default function ChatBottom() {
    // const [text ,setText] = useState("")

    const [currentChatSession, setCurrentChatSession] = useRecoilState(CurrentChatSessionAtom);
    const [currentChatSessionRecord, setCurrentChatSessionRecord] = useRecoilState(CurrentChatSessionRecordAtom);
    const [recordCompleting, setRecordCompleting] = useRecoilState(RecordCompletingAtom);
    const setChatSessions = useSetRecoilState(ChatSessionsAtom);

    const [textAreaValue, setTextAreaValue] = useState("");
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

    const { loading, run: completion } = useRequest(completionApi, {
        manual: true,
        onSuccess: async (reader, params) => {
            // console.info(result);
            console.info(222222222222);
            setRecordCompleting(true);
            let str = "";
            let last = "";
            const decoder = new TextDecoder("utf-8");
            function push() {
                // "done" is a Boolean and value a "Uint8Array"
                reader.read().then(({ done, value }) => {
                    // Is there no more data to read?
                    if (done) {
                        setRecordCompleting(false);
                        if (!str) {
                            message.error("?????????????????????,???????????????.");
                            return;
                        }

                        if (str.indexOf(`"type": "invalid_request_error"`) != -1) {
                            if (str.indexOf(`"code": "context_length_exceeded"`) != -1) {
                                message.error("????????????????????????,??????????????????");
                                return;
                            }
                            message.error("????????????,???????????????");
                            return;
                        }

                        // console.info("??????");
                        if (currentChatSession == null) {
                            const sessionId = parseInt(str.match(/session:\[(.+)\]/)?.[1]);
                            setCurrentChatSession(sessionId);
                            getChatSessions();
                        }

                        return;
                    }

                    str += decoder.decode(value, { stream: true });
                    // console.info(str);
                    const index = str.lastIndexOf("\n");
                    if (index !== -1) {
                        // ?????? \"choices\":{} ???????????????
                        // var regex = /\"delta\":\{\"content\":\"(.+)\"\}/g;
                        var regex = /\"delta\":\{\"content\":\"(.+)\"\}/g;
                        // ???????????????????????????????????????
                        var matches = [];
                        var match;
                        const tempStr = str.substring(0, str.lastIndexOf("\n"));
                        while ((match = regex.exec(tempStr)) != null) {
                            // ??????????????????????????????
                            matches.push(match[1]);
                        }

                        // ?????????????????????????????????
                        var s = matches.join("");

                        // console.info(s);
                        if (s != last) {
                            last = s;
                            // console.info(s);
                            setCurrentChatSessionRecord((r) => {
                                if (r.length == 0) {
                                    return r;
                                }
                                const copy = [...r];
                                copy[copy.length - 1] = { ...copy[copy.length - 1] };
                                const obj = JSON.parse(`{"content":"${s}"}`);
                                copy[copy.length - 1].content = obj.content;
                                return copy;
                            });
                        }
                    }

                    push();
                    // Get the data and send it to the browser via the controller
                });
            }

            push();

            // if (result.status != 200) {
            //     return;
            // }
            // if (currentChatSession == null) {
            //     setCurrentChatSession(result.data.sessionId);
            //     getChatSessions();
            // } else if (currentChatSession != result.data.sessionId) {
            //     // ????????????session??? ?????????????????????
            //     return;
            // }

            // let index = 0;
            // const last = { ...currentChatSessionRecord[currentChatSessionRecord.length - 1] };
            // const clear = setInterval(() => {
            //     last.content += result.data.content[index++];
            //     const temp = [...currentChatSessionRecord];
            //     temp[temp.length - 1] = { ...last };
            //     setCurrentChatSessionRecord(temp);
            //     if (index == result.data.content.length - 1) {
            //         clearInterval(clear);
            //     }
            // }, 15);

            // setCurrentChatSessionRecord((records) => {
            //     return [...records, { role: "assistant", content: result.data.content }];
            // });
        },
        onError: (e) => {
            console.info(111111111111);
            setRecordCompleting(false);
            message.error(e.message);
        },
    });

    const send = () => {
        if (!recordCompleting && !loading && textAreaValue) {
            setTextAreaValue("");
            completion(currentChatSession, textAreaValue);
            setCurrentChatSessionRecord((record) => {
                return [...record, { role: "user", content: textAreaValue }, { role: "assistant", content: "" }];
            });
        }
    };
    return (
        <div className={styles.bottom}>
            <div style={{ width: 768 }}>
                <div className={styles.sendInput}>
                    <TextArea
                        className={styles.textArea}
                        autoSize={{ minRows: 1, maxRows: 8 }}
                        size="large"
                        value={textAreaValue}
                        onChange={(v) => {
                            setTextAreaValue(v.target.value);
                        }}
                        onPressEnter={(e) => {
                            if (!e.shiftKey) {
                                e.preventDefault();
                                send();
                            }
                        }}
                    ></TextArea>
                    {loading || recordCompleting ? <LoadingOutlined className={styles.loadingOutlined} /> : <SendOutlined className={styles.sendOutlined} onClick={send} />}
                </div>
                <div className={styles.tips}>ChatGPT model : gpt-3.5-turbo , Update time : 2023/03</div>
            </div>
        </div>
    );
}
