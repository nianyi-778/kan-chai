import { SetStateAction, useEffect, useRef, useState } from "react"
import { Input, Popover, Tooltip } from 'antd';
import Icon from "@/components/Icon";
import styles from './index.module.less';
import { useParams } from 'react-router-dom';
import { Quadrant, Todo } from "@/types/todo";
import { parseInt } from "lodash-es";
import { CheckOutlined } from '@ant-design/icons';
import { levels } from "@/constants/config";

const { TextArea } = Input;



export default function AddTodo() {
    const { type = Quadrant.Third, id } = useParams();
    const ref = useRef<Todo | null>(null);
    const [curLevel, setLevel] = useState<Quadrant>(+type);
    const [open, setOpen] = useState(false);
    const curLevelIndex = levels.findIndex(l => l.level === curLevel);
    const [title, setTitle] = useState<string>();
    const [describe, setDescribe] = useState<string>();


    useEffect(() => {
        if (id) {
            (async () => {
                const result = await window.ipcRenderer.invoke("TodoGet", id) as Todo;
                ref.current = result;
                console.log(result);
                setTitle(result.title);
                setDescribe(result.description)
                setLevel(result.priority);
            })()
        }
    }, [id]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (ref.current) {
                if (ref.current.title === title && ref.current.description === describe && ref.current.priority === curLevel) {
                    return;
                }
            }
            if (!title) {
                return;
            }
            window.ipcRenderer.send("TodoCurd", {
                title,
                description: describe,
                priority: curLevel,
                id: id ? parseInt(id, 10) : null
            });

            window.removeEventListener('beforeunload', handleBeforeUnload);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [title, describe, curLevel, id]);


    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
    };

    const onInputChange = (e: { target: { value: SetStateAction<string | undefined>; }; }) => {
        setTitle(e.target.value);
    }
    const onTextAreaChange = (e: { target: { value: SetStateAction<string | undefined>; }; }) => {
        setDescribe(e.target.value)
    }

    const content = <div className=" w-[130px]">{
        levels.map((level, key) => {
            const active = curLevelIndex === key;

            return <p onClick={() => {
                setLevel(level.level);
                setOpen(false);
            }}
                className={` cursor-pointer leading-[30px] flex items-center hover:bg-[#f7f7f7] px-[12px] ${active ? 'text-[#4772fa]' : ''}`}
                key={level.level}>
                <Icon styles={{
                    color: level.color
                }} classNames={`text-[16px] mr-[4px]`} name="icon-hongqi"></Icon>{level.label}优先级

                {
                    active ? <CheckOutlined className=" ml-[16px]" /> : null
                }

            </p>
        })
    }</div>


    return <div className=" w-full h-full bg-white ">
        <div className=" flex justify-between items-center px-[20px] h-[44px] border-b-[#f2f2f2] border-b">
            <span>设置日期</span>
            <Popover content={content}
                overlayClassName={styles.level}
                open={open}
                onOpenChange={handleOpenChange}
                placement="bottomLeft" trigger="click">
                <Tooltip title="优先级">
                    <span className=" cursor-pointer hover:bg-[#f1f1f1] px-[6px] rounded">
                        <Icon name="icon-hongqi" classNames={`text-[20px]`} styles={{
                            color: levels[curLevelIndex]?.color
                        }}></Icon>
                    </span>
                </Tooltip>

            </Popover>
        </div>
        <div className=" px-[10px] w-full">
            <div className=" pt-[2px]">
                <Input size="large"
                    onChange={onInputChange}
                    value={title} autoFocus className=" border-none hover:border-none focus:shadow-none font-bold focus-within::border-none focus-within:shadow-none" placeholder="准备做什么？" />
            </div>
            <TextArea className=" border-none hover:border-none focus:shadow-none text-[14px] focus-within::border-none focus-within:shadow-none" size="large"
                showCount
                onChange={onTextAreaChange}
                value={describe}
                style={{ height: 180, resize: 'none' }}
                placeholder="描述" maxLength={120} />
        </div>
    </div>
}