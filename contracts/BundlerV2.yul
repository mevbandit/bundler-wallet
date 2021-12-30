object "BundlerV2" {
    code {
        sstore(0, caller())
        datacopy(0, dataoffset("main"), datasize("main"))
        return(0, datasize("main"))
    }
    object "main" {
        code {
            /* revert if caller is not owner */
            if iszero(eq(sload(0), caller())) { revert(0, 0) }
            
            /*
                Bundler loop.
                The variable `p` is a pointer to the current location in the calldata array.
                The variable `end` is the pointer location where the calldata array ends.
                Each iteration of the loop increments `p` until the end of the array is found.
            */
            let end := calldatasize()
            for { let p := 0 } lt(p, end) { p := add(p, 0x20) } {
                /* Get first word of the bundled call */
                let encodedHeader := calldataload(p)

                /* Retrieve target address */
                let target := shr(96, encodedHeader)

                /* Retrieve ETH value */
                let sendValue := shr(176, shl(160, encodedHeader))

                /* Retrieve calldata size */
                let size := and(encodedHeader, 0xffff)

                /* If size is nonzero, store the data to memory and increment `p` accordingly */
                if iszero(iszero(size)) {
                    calldatacopy(0, add(p, 0x20), size)
                    p := add(p, size)
                }

                /* Attempt the call. A single revert is enough to revert the whole bundle. */
                if iszero(call(gas(), target, sendValue, 0, size, 0, 0)) {
                    revert(0, 0)
                }

                /* If there is return data, then log that data. */
                /* uncomment this to log return data
                let returnsize := returndatasize()
                if iszero(iszero(returnsize)) {
                    returndatacopy(0, 0, returnsize)
                    log0(0, returnsize)
                }
                */
            }
        }
    }
}