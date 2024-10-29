declare namespace N {
    function datafilter (condition: ConditionCallbackFunction | string): object[];
    function datasort (key: string, reverse: boolean): object[];
    function formatter (row: number): TODO;
    function validator (row: number): TODO;
}

/** TODO
 * [
 *     {
 *         "numeric": "266,734.120000",
 *         "generic": "abABCD",
 *         "limit": "Hello Natural...",
 *         "etc": "2014-06-26 12:12"
 *     },
 *     {
 *         "numeric": "123,334,424.353300",
 *         "generic": "ijABCD",
 *         "limit": "Do you like N...",
 *         "etc": "2014-06-26 12:12"
 *     }
 * ]
 */

declare interface N {
    datafilter (callBack): Communicator;
    cont (callback: object): N;
}

declare type ConditionCallbackFunction = {
    (item: object): boolean;
}
