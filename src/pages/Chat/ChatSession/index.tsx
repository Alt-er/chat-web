import { Button, Layout, List, Typography } from "antd";
import styles from "./index.less";
import { PlusOutlined, MessageOutlined, UserOutlined, RobotOutlined } from "@ant-design/icons";
import * as classNames from "classnames";
import { useRecoilState, useRecoilValue } from "recoil";
import { CurrentChatSessionAtom, CurrentChatSessionRecordAtom, RecordCompletingAtom } from "@/recoil/chat";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
const { Header, Footer, Sider, Content } = Layout;
import remarkGfm from "remark-gfm";
// import rehypeRaw from "rehype-raw";
import { CopyToClipboard } from "react-copy-to-clipboard";
function UserMessage(props: { children: string }) {
    return (
        <div className={classNames(styles.messageWarpper, styles.userMessageWarpper)}>
            <div className={styles.message}>
                <div className={classNames(styles.outlinedWarpper, styles.userOutlinedWarpper)}>
                    <UserOutlined />
                </div>
                {props.children}
            </div>
        </div>
    );
}

function RebotMessage(props: { children: string }) {
    return (
        <div className={classNames(styles.messageWarpper, styles.rebotMessageWarpper)}>
            <div className={styles.message}>
                <div className={classNames(styles.outlinedWarpper, styles.rebotOutlinedWarpper)}>
                    <RobotOutlined />
                </div>
                <div style={{ overflow: "auto" }}>
                    {!props.children && <div className={styles.cursor}></div>}
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        // rehypePlugins={[rehypeRaw]}
                        components={{
                            code({ node, inline, className, children, ...props }) {
                                // console.info(node, inline, className, children);
                                const match = /language-(\w+)/.exec(className || "");
                                return !inline ? (
                                    <div className={styles.rebotCodeBlock}>
                                        <SyntaxHighlighter showLineNumbers children={String(children).replace(/\n$/, "")} style={vscDarkPlus as any} language={match?.[1]} {...props} />
                                        <CopyToClipboard
                                            text={children.join("\n").toString()}
                                            // onCopy={(e, e2) => {
                                            //     console.info(e, e2);
                                            // }}
                                        >
                                            <button
                                                onClick={(e) => {
                                                    const target = e.currentTarget;
                                                    const text = target.innerText || target.textContent;
                                                    target.innerText = "Copied";
                                                    target.textContent = "Copied";
                                                    setTimeout(() => {
                                                        target.innerText = text;
                                                        target.textContent = text;
                                                    }, 1000);
                                                }}
                                            >
                                                Copy
                                            </button>
                                        </CopyToClipboard>
                                    </div>
                                ) : (
                                    <code className={classNames(className, styles.inlineCodeBlock)} {...props}>
                                        {children}
                                    </code>
                                );
                            },
                        }}
                    >
                        {props.children}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
export default function ChatSession() {
    const currentChatSession = useRecoilValue(CurrentChatSessionAtom);
    const [currentChatSessionRecord, setCurrentChatSessionRecord] = useRecoilState(CurrentChatSessionRecordAtom);
    const [recordCompleting, setRecordCompleting] = useRecoilState(RecordCompletingAtom);
    const ref = useRef<HTMLDivElement>();

    useEffect(() => {
        const element = ref.current;
        if (element)
            element.lastElementChild.scrollIntoView({
                behavior: "smooth",
                block: "end",
            });
    }, [currentChatSessionRecord]);
    if (currentChatSessionRecord.length == 0) {
        return (
            <>
                <h1 style={{ textAlign: "center", color: "white", fontSize: "36px", marginTop: "160px" }}>ChatGPT</h1>
                <div style={{ textAlign: "center", color: "white", fontSize: "12px", marginTop: "6px" }}>您好，请问有什么可以为您效劳的吗？</div>
            </>
        );
    }

    const streaming = recordCompleting ? styles.sessionStreaming : undefined;
    return (
        <div ref={ref} className={classNames(styles.sessionWarpper, streaming)}>
            {currentChatSessionRecord.map((r, i) => {
                return r.role === "user" ? <UserMessage key={i}>{r.content}</UserMessage> : <RebotMessage key={i}>{r.content}</RebotMessage>;
            })}
            <div style={{ height: 200 }}></div>
        </div>
    );
}
