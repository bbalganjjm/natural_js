declare type DocumentsOnBeforeEntireLoad = {
    (this: Documents, docId?: string): void;
}
declare type DocumentsOnErrorEntireLoad = {
    (this: Documents, docId?: string): void;
}
declare type DocumentsOnEntireLoad = {
    (this: Documents, docId?: string): void;
}

declare type DocumentsRemoveStateCallback = {
    (this: Documents, docId?: string): void;
}
declare type DocumentsOnBeforeLoad = {
    (this: Documents, docId?: string): void;
}
declare type DocumentsOnLoad = {
    (this: Documents, docId?: string): void;
}
declare type DocumentsOnBeforeActive = {
    (this: Documents, docId?: string): void;
}
declare type DocumentsOnActive = {
    (this: Documents, docId?: string): void;
}
declare type DocumentsOnBeforeInactive = {
    (this: Documents, docId?: string): void;
}
declare type DocumentsOnInactive = {
    (this: Documents, docId?: string): void;
}
declare type DocumentsOnBeforeRemoveState = {
    (this: Documents, docId?: string): void;
}
declare type DocumentsORemoveState = {
    (this: Documents, docId?: string): void;
}
declare type DocumentsOnBeforeRemove = {
    (this: Documents, docId?: string): void;
}
declare type DocumentsOnRemove = {
    (this: Documents, docId?: string): void;
}