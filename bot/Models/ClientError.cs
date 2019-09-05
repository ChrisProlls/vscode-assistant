using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CoreBot.Models
{
    public class ClientError
    {
        public string Message { get; set; }
        public string Code { get; set; }
        public string Source { get; set; }
        public string Line { get; set; }
    }
}
