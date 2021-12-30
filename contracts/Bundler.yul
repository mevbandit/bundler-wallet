object "Bundler" {
    code {
        sstore(0, caller())
        datacopy(0, dataoffset("main"), datasize("main"))
        return(0, datasize("main"))
    }
    object "main" {
        code {
            if iszero(eq(sload(0), caller())) { revert(0, 0) }
            let end := calldatasize()
            for { let p := 0 } lt(p, end) { p := add(p, 32) } {
                let encodedHeader := calldataload(p)                
                let target := shr(96, encodedHeader)
                let sendValue := shr(176, shl(160, encodedHeader))
                let size := and(encodedHeader, 0xffff)

                if iszero(iszero(size)) {
                    calldatacopy(0, add(p, 32), size)
                    p := add(p, size)
                }

                if iszero(call(gas(), target, sendValue, 0, size, 0, 0)) {
                    revert(0, 0)
                }
            }
        }
    }
}