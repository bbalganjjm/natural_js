declare namespace N {
    const code = Code;
}

type CodeInspectionResult = {
    level: string;
    message: string;
    line: number;
    code: string;
};